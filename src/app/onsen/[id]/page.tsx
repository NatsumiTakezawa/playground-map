/**
 * S01 温泉詳細ページ
 * @package MatsueOnsenMap
 * @module app/onsen/[id]/page
 */
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/supabase.types";
import { notFound } from "next/navigation";
import Image from "next/image";

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
export default async function OnsenDetailPage({ params }: { params: { id: string } }) {
  // 温泉データ取得
  const { data: onsen, error: onsenError } = await supabase
    .from("onsen")
    .select("*")
    .eq("id", params.id)
    .single();
  if (onsenError || !onsen) return notFound();

  // レビュー一覧取得
  const { data: reviews } = await supabase
    .from("review")
    .select("*")
    .eq("onsen_id", params.id)
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header（共通） */}
      <header className="w-full px-4 py-3 flex items-center justify-between border-b bg-white">
        <div className="font-bold text-lg text-primary-700">松江市温泉マップ</div>
      </header>
      {/* ImageCarousel（暫定1枚） */}
      <div className="w-full h-64 relative bg-gray-100 flex items-center justify-center">
        {onsen.images && onsen.images.length > 0 ? (
          <Image src={onsen.images[0]} alt={onsen.name} fill className="object-cover rounded" />
        ) : (
          <span className="text-gray-400">画像なし</span>
        )}
      </div>
      {/* SpotHeader */}
      <section className="p-4 border-b">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{onsen.name}</h1>
        <div className="text-gray-600 mb-2">{onsen.description}</div>
        <div className="flex flex-wrap gap-1 mb-2">
          {(onsen.tags || []).map((tag) => (
            <span key={tag} className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">#{tag}</span>
          ))}
        </div>
      </section>
      {/* SpotInfoTabs（概要のみ） */}
      <section className="p-4">
        <h2 className="font-bold text-lg mb-2">レビュー</h2>
        <ul className="space-y-2">
          {reviews && reviews.length > 0 ? (
            reviews.map((review) => (
              <li key={review.id} className="bg-white rounded shadow p-3">
                <div className="font-bold text-accent-500">★{review.rating}</div>
                <div className="text-gray-700 text-sm mt-1">{review.comment}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(review.created_at).toLocaleString()}</div>
              </li>
            ))
          ) : (
            <li className="text-gray-400">レビューはまだありません</li>
          )}
        </ul>
      </section>
      {/* WriteReviewButton（ダミー） */}
      <div className="w-full flex justify-center py-4">
        <button className="bg-primary-500 text-white px-6 py-2 rounded font-bold hover:bg-primary-700 transition">レビューを書く</button>
      </div>
      {/* BannerAd（サンプル） */}
      <div className="w-full flex justify-center py-4">
        <div className="w-full max-w-2xl h-20 bg-gradient-to-r from-primary-100 to-primary-50 rounded-lg flex items-center justify-center text-primary-700 font-semibold">
          広告バナー（サンプル）
        </div>
      </div>
      {/* Footer */}
      <footer className="w-full text-center text-xs text-gray-500 py-2 border-t bg-white">© 2025 松江市温泉マップ</footer>
    </main>
  );
}
