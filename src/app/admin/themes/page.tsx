"use client";
/**
 * S09 テーマ管理画面（テーマ一覧・複製ボタン）
 * @package MatsueOnsenMap
 * @module app/admin/themes/page
 */
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/supabase.types";

/**
 * テーマデータ型
 */
type Theme = Database["public"]["Tables"]["theme"]["Row"];

export default function AdminThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchThemes() {
      setLoading(true);
      const { data } = await supabase.from("theme").select("*");
      setThemes(data ?? []);
      setLoading(false);
    }
    fetchThemes();
  }, []);

  return (
    <main className="min-h-screen bg-primary-50 p-8">
      <h1 className="text-2xl font-bold mb-6">テーマ管理</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <div
            key={theme.id}
            className="bg-white rounded shadow p-4 flex flex-col gap-2"
          >
            <div className="font-bold text-lg text-primary-700">
              {theme.name}
            </div>
            <div className="text-xs text-gray-500">スラッグ: {theme.slug}</div>
            <div className="text-xs text-gray-500">
              メインカラー:{" "}
              <span style={{ color: theme.primary_color || "#3B82F6" }}>
                {theme.primary_color || "#3B82F6"}
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <button className="bg-primary-100 text-primary-700 px-3 py-1 rounded font-bold hover:bg-primary-200">
                複製
              </button>
              <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded font-bold border hover:bg-red-100">
                削除
              </button>
            </div>
          </div>
        ))}
        {themes.length === 0 && !loading && (
          <div className="col-span-full text-gray-400 text-center py-12">
            テーマがありません
          </div>
        )}
      </div>
    </main>
  );
}
