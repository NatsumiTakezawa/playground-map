/**
 * S01 温泉詳細ページ
 * @package MatsueOnsenMap
 * @module app/onsen/[id]/page
 */
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/supabase.types";
import { notFound } from "next/navigation";
import ImageCarousel from "@/components/ImageCarousel";
import SpotHeader from "@/components/SpotHeader";
import { useEffect, useState, useTransition } from "react";
import ReviewModal from "@/components/ReviewModal";
import { revalidatePath } from "next/cache";

/**
 * 温泉データ型
 */
type Onsen = Database["public"]["Tables"]["onsen"]["Row"];

/**
 * レビューデータ型
 */
type Review = Database["public"]["Tables"]["review"]["Row"];

/**
 * 温泉詳細ページ
 * @param params.id - 温泉ID
 */
export default function OnsenDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [onsen, setOnsen] = useState<Onsen | null>(null);
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [isReviewModalOpen, setReviewModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 0;
  const reviewCount = reviews ? reviews.length : 0;

  useEffect(() => {
    async function fetchData() {
      const { data: onsen, error: onsenError } = await supabase
        .from("onsen")
        .select("*")
        .eq("id", params.id)
        .single();
      if (onsenError || !onsen) {
        notFound();
        return;
      }
      setOnsen(onsen);

      const { data: reviews } = await supabase
        .from("review")
        .select("*")
        .eq("onsen_id", params.id)
        .order("created_at", { ascending: false });
      setReviews(reviews || []);
    }

    fetchData();
  }, [params.id]);

  if (!onsen) {
    return <div>Loading...</div>;
  }

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
          {(onsen.tags || []).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      </section>
      {/* SpotInfoTabs（雛形） */}
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
        {/* 概要タブ内容 */}
        <div className="text-gray-600 mb-2">{onsen.description}</div>
        {/* レビューリストは今後タブ切替で分離 */}
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
                  {new Date(review.created_at).toLocaleString()}
                </div>
              </li>
            ))
          ) : (
            <li className="text-gray-400">レビューはまだありません</li>
          )}
        </ul>
      </section>
      {/* WriteReviewButton（モーダル起動） */}
      <div className="w-full flex justify-center py-4">
        <button
          className="bg-primary-500 text-white px-6 py-2 rounded font-bold hover:bg-primary-700 transition"
          onClick={() => setReviewModalOpen(true)}
        >
          レビューを書く
        </button>
      </div>
      <ReviewModal
        open={isReviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={async (rating, comment, image) => {
          // Supabaseへレビュー投稿処理
          // TODO: 認証ユーザー取得・画像アップロード対応
          const { error } = await supabase.from("review").insert({
            onsen_id: params.id,
            user_id: null, // TODO: 認証ユーザーIDに置換
            rating,
            comment,
          });
          setReviewModalOpen(false);
          // レビューリスト再取得
          startTransition(() => {
            revalidatePath(`/onsen/${params.id}`);
          });
          // TODO: トースト通知
        }}
      />
      {/* BannerAd（サンプル） */}
      <div className="w-full flex justify-center py-4">
        <div className="w-full max-w-2xl h-20 bg-gradient-to-r from-primary-100 to-primary-50 rounded-lg flex items-center justify-center text-primary-700 font-semibold">
          広告バナー（サンプル）
        </div>
      </div>
      {/* Footer */}
      <footer className="w-full text-center text-xs text-gray-500 py-2 border-t bg-white">
        © 2025 松江市温泉マップ
      </footer>
    </main>
  );
}
