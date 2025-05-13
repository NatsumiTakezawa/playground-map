"use client";
/**
 * S05 管理ダッシュボード
 * @package MatsueOnsenMap
 * @module app/admin/page
 */
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminMenu from "@/components/AdminMenu";

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({
    spots: "--",
    reviews: "--",
    ads: "--",
  });
  const router = useRouter();

  // 仮認証: localStorageで認可
  useEffect(() => {
    if (typeof window === "undefined") return;
    const userStr = localStorage.getItem("loginUser");
    if (!userStr) {
      router.replace("/auth/signin");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      router.replace("/auth/signin");
      return;
    }
  }, [router]);

  // ダミー集計値（仮認証用: 固定値）
  useEffect(() => {
    setCounts({ spots: "3", reviews: "5", ads: "2" });
  }, []);

  return (
    <main className="min-h-screen flex bg-primary-50">
      <AdminMenu />
      <div className="flex-1 flex flex-col p-8 gap-8">
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
      </div>
    </main>
  );
}
