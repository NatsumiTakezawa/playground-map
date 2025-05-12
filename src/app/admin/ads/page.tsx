/**
 * S08 広告管理画面（バナー一覧・新規作成・スケジュール設定）
 * @package MatsueOnsenMap
 * @module app/admin/ads/page
 */
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/supabase.types";
import Link from "next/link";

/**
 * 広告バナーデータ型
 */
type AdBanner = Database["public"]["Tables"]["ad_banner"]["Row"];

export default function AdminAdsPage() {
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAds() {
      setLoading(true);
      const { data } = await supabase.from("ad_banner").select("*");
      setAds(data ?? []);
      setLoading(false);
    }
    fetchAds();
  }, []);

  return (
    <main className="min-h-screen bg-primary-50 p-8">
      <h1 className="text-2xl font-bold mb-6">広告管理</h1>
      <div className="flex justify-end mb-4">
        <Link href="/admin/ads/new" className="bg-primary-500 text-white px-4 py-2 rounded font-bold hover:bg-primary-700 transition">新規バナー作成</Link>
      </div>
      {/* BannerPreviewGrid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ads.map(ad => (
          <div key={ad.id} className="bg-white rounded shadow p-4 flex flex-col gap-2">
            <img src={ad.image_url} alt="バナー画像" className="w-full h-32 object-cover rounded" />
            <div className="text-sm text-gray-700 truncate">{ad.link_url}</div>
            <div className="text-xs text-gray-500">掲載期間: {ad.start_at?.slice(0,10)} ～ {ad.end_at?.slice(0,10)}</div>
            <div className="text-xs text-gray-500">掲載位置: {ad.placement}</div>
            <div className="flex gap-2 mt-2">
              <Link href={`/admin/ads/${ad.id}`} className="text-primary-700 hover:underline">編集</Link>
              <button className="text-red-500 hover:underline text-xs">削除</button>
            </div>
          </div>
        ))}
        {ads.length === 0 && !loading && (
          <div className="col-span-full text-gray-400 text-center py-12">バナーがありません</div>
        )}
      </div>
    </main>
  );
}
