/**
 * S01 温泉詳細ページ
 * @package MatsueOnsenMap
 * @module app/onsen/[id]/page
 */
import { supabase } from "@/lib/supabaseClient";
import ImageCarousel from "@/components/ImageCarousel";
import SpotHeader from "@/components/SpotHeader";

/**
 * S01 温泉詳細ページ（サーバーコンポーネント化）
 */
export default async function OnsenDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // サーバーサイドで温泉データ・レビューを取得
  const { data: onsen, error: onsenError } = await supabase
    .from("onsen")
    .select("*")
    .eq("id", params.id)
    .single();
  if (onsenError || !onsen)
    return <div className="p-8 text-red-500">データ取得に失敗しました</div>;
  const { data: reviews } = await supabase
    .from("review")
    .select("*")
    .eq("onsen_id", params.id)
    .order("created_at", { ascending: false });
  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce(
          (sum: number, r: { rating?: number }) => sum + (r.rating || 0),
          0
        ) / reviews.length
      : 0;
  const reviewCount = reviews ? reviews.length : 0;
  const activeTab = "overview";
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header（共通） */}
      <header className="w-full px-4 py-3 flex items-center justify-between border-b bg-white">
        <div className="font-bold text-lg text-primary-700">
          松江市温泉マップ
        </div>
      </header>
      {/* ImageCarousel */}
      <ImageCarousel images={onsen.images || []} alt={onsen.name} />
      {/* SpotHeader */}
      <section className="p-4 border-b">
        <SpotHeader
          name={onsen.name}
          rating={avgRating}
          reviewCount={reviewCount}
        />
        <div className="flex flex-wrap gap-1 mb-2">
          {(onsen.tags || []).map((tag: string) => (
            <span
              key={tag}
              className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      </section>
      <section className="p-4">
        <div className="flex gap-4 border-b mb-4">
          <button
            className={`pb-2 font-bold ${
              activeTab === "overview"
                ? "border-b-2 border-primary-500 text-primary-700"
                : "text-gray-500"
            }`}
          >
            概要
          </button>
          <button className="pb-2 text-gray-400" disabled>
            写真
          </button>
          <button className="pb-2 text-gray-400" disabled>
            レビュー
          </button>
        </div>
        <div className="text-gray-600 mb-2">{onsen.description}</div>
        <h2 className="font-bold text-lg mb-2">レビュー</h2>
        <ul className="space-y-2">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <li key={review.id} className="bg-white rounded shadow p-3">
                <div className="font-bold text-accent-500">
                  ★{review.rating}
                </div>
                <div className="text-gray-700 text-sm mt-1">
                  {review.comment}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {review.created_at &&
                    new Date(review.created_at).toLocaleString()}
                </div>
              </li>
            ))
          ) : (
            <li className="text-gray-400">レビューはまだありません</li>
          )}
        </ul>
      </section>
      {/* WriteReviewButton（モーダル起動） */}
      {/*
      <div className="w-full flex justify-center py-4">
        <Suspense fallback={null}>
          <ReviewModal ... />
        </Suspense>
      </div>
      */}
      {/* BannerAd（サンプル） */}
      <div className="w-full flex justify-center py-4">
        <div className="w-full max-w-2xl h-20 bg-gradient-to-r from-primary-100 to-primary-50 rounded-lg flex items-center justify-center text-primary-700 font-semibold">
          広告バナー（サンプル）
        </div>
      </div>
      {/* Footer（共通） */}
      <footer className="w-full px-4 py-4 text-center text-xs text-gray-400 border-t bg-white mt-auto">
        &copy; {new Date().getFullYear()} 松江市温泉マップ
      </footer>
    </main>
  );
}
