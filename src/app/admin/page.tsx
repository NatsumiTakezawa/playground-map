/**
 * S05 管理ダッシュボード
 * @package MatsueOnsenMap
 * @module app/admin/page
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({
    spots: "--",
    reviews: "--",
    ads: "--",
  });
  const router = useRouter();

  useEffect(() => {
    async function fetchCounts() {
      // 認証ユーザー取得
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/auth/signin");
        return;
      }
      // ユーザー情報取得
      const { data: userInfo } = await supabase
        .from("users")
        .select("role")
        .eq("id", user.id)
        .single();
      if (!userInfo || userInfo.role !== "admin") {
        router.replace("/auth/signin");
        return;
      }
      // 集計値取得
      const [{ count: spotCount }, { count: reviewCount }, { count: adCount }] =
        await Promise.all([
          supabase.from("onsen").select("id", { count: "exact", head: true }),
          supabase.from("review").select("id", { count: "exact", head: true }),
          supabase
            .from("ad_banner")
            .select("id", { count: "exact", head: true }),
        ]);
      setCounts({
        spots: spotCount?.toString() ?? "--",
        reviews: reviewCount?.toString() ?? "--",
        ads: adCount?.toString() ?? "--",
      });
    }
    fetchCounts();
  }, [router]);

  return (
    <main className="min-h-screen flex bg-primary-50">
      {/* NavSidebar */}
      <aside className="w-56 bg-white border-r flex flex-col p-4 gap-4 min-h-screen">
        <div className="font-bold text-lg text-primary-700 mb-6">
          管理メニュー
        </div>
        <nav className="flex flex-col gap-2">
          <Link href="/admin" className="font-medium text-primary-700">
            ダッシュボード
          </Link>
          <Link
            href="/admin/spots"
            className="text-gray-700 hover:text-primary-700"
          >
            スポットCMS
          </Link>
          <Link
            href="/admin/ads"
            className="text-gray-700 hover:text-primary-700"
          >
            広告管理
          </Link>
          <Link
            href="/admin/themes"
            className="text-gray-700 hover:text-primary-700"
          >
            テーマ管理
          </Link>
        </nav>
        <div className="mt-auto">
          <button className="text-xs text-gray-400 hover:underline">
            サインアウト
          </button>
        </div>
      </aside>
      {/* メイン */}
      <section className="flex-1 flex flex-col p-8 gap-8">
        <h1 className="text-2xl font-bold mb-4">管理ダッシュボード</h1>
        {/* StatsCards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <div className="text-3xl font-bold text-primary-700">
              {counts.spots}
            </div>
            <div className="text-gray-600 mt-2">スポット数</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <div className="text-3xl font-bold text-primary-700">
              {counts.reviews}
            </div>
            <div className="text-gray-600 mt-2">レビュー数</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center">
            <div className="text-3xl font-bold text-primary-700">
              {counts.ads}
            </div>
            <div className="text-gray-600 mt-2">広告数</div>
          </div>
        </div>
        {/* ThemeSwitcher（ダミー） */}
        <div className="mt-8">
          <span className="font-bold mr-2">テーマ切替:</span>
          <button className="bg-primary-100 text-primary-700 px-3 py-1 rounded mr-2">
            デフォルト
          </button>
          <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded">
            ダーク
          </button>
        </div>
      </section>
    </main>
  );
}
