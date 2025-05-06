/**
 * S06 スポットCMS（温泉一覧）
 * @package MatsueOnsenMap
 * @module app/admin/spots/page
 */
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/supabase.types";
import { useState, useEffect } from "react";

/**
 * 温泉データ型
 */
type Onsen = Database["public"]["Tables"]["onsen"]["Row"];

export default function AdminSpotsPage() {
  const [spots, setSpots] = useState<Onsen[]>([]);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    async function fetchSpots() {
      const { data } = await supabase.from("onsen").select("*");
      setSpots(data ?? []);
    }
    fetchSpots();
  }, []);

  const filtered = spots.filter(s =>
    s.name?.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-primary-50 p-8">
      <h1 className="text-2xl font-bold mb-6">スポットCMS（温泉一覧）</h1>
      {/* FilterBar */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="border rounded p-2 w-64"
          placeholder="温泉名で検索"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
        />
        <button className="bg-primary-500 text-white px-4 py-2 rounded font-bold hover:bg-primary-700 transition">検索</button>
        {/* CSVImportBtn（ダミー） */}
        <button className="ml-auto bg-gray-100 text-gray-700 px-4 py-2 rounded font-bold border hover:bg-primary-100">CSVインポート</button>
      </div>
      {/* DataTable */}
      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-primary-50">
              <th className="p-2 text-left">ID</th>
              <th className="p-2 text-left">名前</th>
              <th className="p-2 text-left">緯度</th>
              <th className="p-2 text-left">経度</th>
              <th className="p-2 text-left">タグ</th>
              <th className="p-2 text-left">編集</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(spot => (
              <tr key={spot.id} className="border-b hover:bg-primary-50">
                <td className="p-2 font-mono text-xs">{spot.id}</td>
                <td className="p-2">{spot.name}</td>
                <td className="p-2">{spot.geo_lat}</td>
                <td className="p-2">{spot.geo_lng}</td>
                <td className="p-2">{(spot.tags || []).join(", ")}</td>
                <td className="p-2">
                  <Link href={`/admin/spots/${spot.id}`} className="text-primary-700 hover:underline">編集</Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-400">該当データがありません</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
