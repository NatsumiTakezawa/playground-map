"use client";
/**
 * S07 スポットCMS（詳細/編集）
 * @package MatsueOnsenMap
 * @module app/admin/spots/[id]/page
 */
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/supabase.types";
import { useRouter, useParams } from "next/navigation";

/**
 * 温泉データ型
 */
type Onsen = Database["public"]["Tables"]["onsen"]["Row"];

export default function AdminSpotEditPage() {
  const router = useRouter();
  const params = useParams();
  const id =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
      ? params.id[0]
      : "";
  const [spot, setSpot] = useState<Onsen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Onsen>>({});

  useEffect(() => {
    async function fetchSpot() {
      setLoading(true);
      const { data, error } = await supabase
        .from("onsen")
        .select("*")
        .eq("id", id)
        .single();
      if (error || !data) {
        setError("データ取得に失敗しました");
        setLoading(false);
        return;
      }
      setSpot(data);
      setForm(data);
      setLoading(false);
    }
    if (id) fetchSpot();
  }, [id]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.from("onsen").update(form).eq("id", id);
    if (error) {
      setError("保存に失敗しました: " + error.message);
      return;
    }
    router.push("/admin/spots");
  }

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!spot) return <div className="p-8 text-gray-400">データがありません</div>;

  return (
    <main className="min-h-screen bg-primary-50 p-8">
      <h1 className="text-2xl font-bold mb-6">スポット編集</h1>
      <form
        onSubmit={handleSave}
        className="space-y-6 max-w-xl bg-white rounded shadow p-8"
      >
        <div>
          <label className="block font-bold mb-1">温泉名</label>
          <input
            className="w-full border rounded p-2"
            value={form.name || ""}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-bold mb-1">緯度</label>
            <input
              type="number"
              step="0.0001"
              className="w-full border rounded p-2"
              value={form.geo_lat ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, geo_lat: parseFloat(e.target.value) }))
              }
              required
            />
          </div>
          <div className="flex-1">
            <label className="block font-bold mb-1">経度</label>
            <input
              type="number"
              step="0.0001"
              className="w-full border rounded p-2"
              value={form.geo_lng ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, geo_lng: parseFloat(e.target.value) }))
              }
              required
            />
          </div>
        </div>
        <div>
          <label className="block font-bold mb-1">説明</label>
          <textarea
            className="w-full border rounded p-2 min-h-[80px]"
            value={form.description || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>
        <div>
          <label className="block font-bold mb-1">タグ（カンマ区切り）</label>
          <input
            className="w-full border rounded p-2"
            value={
              Array.isArray(form.tags) ? form.tags.join(",") : form.tags || ""
            }
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                tags: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              }))
            }
          />
        </div>
        {/* MapPicker（ダミー） */}
        <div>
          <label className="block font-bold mb-1">
            地図で位置を選択（今後実装）
          </label>
          <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center text-gray-400">
            MapPicker（ダミー）
          </div>
        </div>
        <div className="flex gap-4 mt-6">
          <button
            type="submit"
            className="bg-primary-500 text-white px-6 py-2 rounded font-bold hover:bg-primary-700 transition"
          >
            保存
          </button>
          <button
            type="button"
            className="bg-gray-100 text-gray-700 px-6 py-2 rounded font-bold border hover:bg-red-100"
            onClick={() => router.push("/admin/spots")}
          >
            キャンセル
          </button>
        </div>
      </form>
    </main>
  );
}
