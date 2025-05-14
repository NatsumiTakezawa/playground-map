"use client";
/**
 * S06 スポットCMS（温泉一覧）
 * @package MatsueOnsenMap
 * @module app/admin/spots/page
 */
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/supabase.types";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminMenu from "@/components/AdminMenu";
import Papa from "papaparse";
import { Dialog } from "@/components/ui/dialog";

/**
 * 温泉データ型
 */
type Onsen = Database["public"]["Tables"]["onsen"]["Row"];

export default function AdminSpotsPage() {
  const router = useRouter();
  const [spots, setSpots] = useState<Onsen[]>([]);
  const [keyword, setKeyword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Onsen>>({});
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // 認証・RBACチェック
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
    setAuthChecked(true);
  }, [router]);

  useEffect(() => {
    async function fetchSpots() {
      const { data, error } = await supabase.from("onsen").select("*");
      if (error) setError(error.message);
      setSpots(data ?? []);
    }
    fetchSpots();
  }, []);

  const filtered = spots.filter((s) =>
    s.name?.toLowerCase().includes(keyword.toLowerCase())
  );

  // 新規作成・編集フォーム送信
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (
      !form.name ||
      form.geo_lat === undefined ||
      form.geo_lng === undefined
    ) {
      setError("必須項目が未入力です");
      // フォームは閉じない
      return;
    }
    if (editId) {
      // 編集
      const { error } = await supabase
        .from("onsen")
        .update(form)
        .eq("id", editId);
      if (error) {
        setError(error.message);
        return;
      }
    } else {
      // 新規
      const insertData = {
        name: form.name,
        geo_lat: form.geo_lat,
        geo_lng: form.geo_lng,
        description: form.description ?? null,
        tags: Array.isArray(form.tags) ? form.tags : [],
        images: [],
      };
      const { error } = await supabase.from("onsen").insert([insertData]);
      if (error) {
        setError(error.message);
        return;
      }
    }
    setShowForm(false);
    setForm({});
    setEditId(null);
    // 再取得
    const { data } = await supabase.from("onsen").select("*");
    setSpots(data ?? []);
  }

  // 編集開始
  function handleEdit(spot: Onsen) {
    setForm(spot);
    setEditId(spot.id);
    setShowForm(true);
  }

  // 削除
  async function handleDelete(id: string) {
    setDeleteId(id);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await supabase.from("onsen").delete().eq("id", deleteId);
    setSpots((prev) => prev.filter((s) => s.id !== deleteId));
    setDeleteId(null);
  }

  // CSVインポート処理
  function handleCsvFile(e: React.ChangeEvent<HTMLInputElement>) {
    setCsvError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (!Array.isArray(results.data) || results.data.length === 0) {
          setCsvError("CSVに有効なデータがありません");
          return;
        }
        setCsvRows(results.data as Record<string, string>[]);
      },
      error: (err) => setCsvError("CSVパースエラー: " + err.message),
    });
  }

  async function handleCsvRegister() {
    setCsvError(null);
    try {
      // 必須項目チェック
      for (const row of csvRows) {
        if (!row.name || !row.geo_lat || !row.geo_lng) {
          setCsvError("必須項目(name, geo_lat, geo_lng)が不足しています");
          return;
        }
      }
      // 一括登録
      const insertData = csvRows.map((row) => ({
        name: row.name,
        geo_lat: parseFloat(row.geo_lat),
        geo_lng: parseFloat(row.geo_lng),
        description: row.description ?? null,
        tags: row.tags ? row.tags.split(",").map((s: string) => s.trim()) : [],
        images: [],
      }));
      const { error } = await supabase.from("onsen").insert(insertData);
      if (error) {
        setCsvError(error.message);
        return;
      }
      setCsvDialogOpen(false);
      setCsvRows([]);
      // 再取得
      const { data } = await supabase.from("onsen").select("*");
      setSpots(data ?? []);
    } catch (e) {
      if (e instanceof Error) setCsvError(e.message);
    }
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        認証確認中...
      </div>
    );
  }

  return (
    <main className="min-h-screen flex bg-primary-50">
      <AdminMenu />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">スポットCMS（温泉一覧）</h1>
        {/* FilterBar */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="border rounded p-2 w-64"
            placeholder="温泉名で検索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button className="bg-primary-500 text-white px-4 py-2 rounded font-bold hover:bg-primary-700 transition">
            検索
          </button>
          {/* CSVImportBtn（ダミー） */}
          <button
            className="ml-auto bg-gray-100 text-gray-700 px-4 py-2 rounded font-bold border hover:bg-primary-100"
            onClick={() => setCsvDialogOpen(true)}
          >
            CSVインポート
          </button>
          <button
            className="bg-primary-500 text-black px-4 py-2 rounded font-bold ml-2"
            onClick={() => {
              setForm({});
              setEditId(null);
              setShowForm(true);
            }}
          >
            新規作成
          </button>
        </div>
        {/* CSVインポートダイアログ */}
        {csvDialogOpen && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow p-8 w-full max-w-lg space-y-4 relative">
              <h2 className="text-xl font-bold mb-2">CSVインポート</h2>
              <input
                type="file"
                accept=".csv"
                onChange={handleCsvFile}
                className="mb-2"
                aria-label="ファイルを選択"
              />
              {csvError && (
                <div
                  className="text-red-500 text-sm"
                  data-testid="error-message"
                >
                  {csvError}
                </div>
              )}
              {csvRows.length > 0 && (
                <div className="max-h-48 overflow-auto border rounded mb-2">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr>
                        <th>name</th>
                        <th>geo_lat</th>
                        <th>geo_lng</th>
                        <th>description</th>
                        <th>tags</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvRows.map((row, i) => (
                        <tr key={i}>
                          <td>{row.name}</td>
                          <td>{row.geo_lat}</td>
                          <td>{row.geo_lng}</td>
                          <td>{row.description}</td>
                          <td>{row.tags}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="flex gap-4 mt-4">
                <button
                  className="bg-primary-500 text-black px-6 py-2 rounded font-bold hover:bg-primary-700 transition"
                  onClick={handleCsvRegister}
                  disabled={csvRows.length === 0}
                >
                  一括登録
                </button>
                <button
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded font-bold border hover:bg-red-100"
                  onClick={() => {
                    setCsvDialogOpen(false);
                    setCsvRows([]);
                    setCsvError(null);
                  }}
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}
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
                <th className="p-2 text-left">削除</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((spot) => (
                <tr
                  key={spot.id}
                  className="border-b hover:bg-primary-50"
                  data-testid={`spot-row-${spot.id}`}
                >
                  <td className="p-2 font-mono text-xs">{spot.id}</td>
                  <td className="p-2 flex items-center gap-2">
                    <img
                      src={
                        spot.images && spot.images.length > 0
                          ? spot.images[0]
                          : "/file.svg"
                      }
                      alt="温泉画像"
                      data-testid={`spot-img-${spot.name}`}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <span data-testid={`spot-name-${spot.name}`}>
                      {spot.name}
                    </span>
                  </td>
                  <td className="p-2">{spot.geo_lat}</td>
                  <td className="p-2">{spot.geo_lng}</td>
                  <td className="p-2">{(spot.tags || []).join(", ")}</td>
                  <td className="p-2">
                    <button
                      className="text-primary-700 hover:underline"
                      onClick={() => handleEdit(spot)}
                    >
                      編集
                    </button>
                  </td>
                  <td className="p-2">
                    <button
                      className="text-red-500 hover:underline"
                      onClick={() => handleDelete(spot.id)}
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-400">
                    該当データがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* 削除確認ダイアログ */}
        <Dialog
          open={!!deleteId}
          onOpenChange={(open) => !open && setDeleteId(null)}
        >
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/30">
            <div className="bg-white rounded shadow p-8 w-full max-w-sm space-y-4">
              <h2 className="text-lg font-bold">本当に削除しますか？</h2>
              <div className="flex gap-4 mt-4 justify-end">
                <button
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded font-bold border hover:bg-primary-100"
                  onClick={() => setDeleteId(null)}
                >
                  キャンセル
                </button>
                <button
                  className="bg-red-500 text-white px-6 py-2 rounded font-bold hover:bg-red-700"
                  onClick={confirmDelete}
                >
                  削除
                </button>
              </div>
            </div>
          </div>
        </Dialog>
        {/* 新規作成・編集フォーム */}
        <Dialog
          open={showForm}
          onOpenChange={(open) => !open && setShowForm(false)}
        >
          <div
            className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
            aria-labelledby="spot-form-title"
          >
            <form
              className="bg-white rounded shadow p-8 w-full max-w-md space-y-4 relative"
              onSubmit={handleSubmit}
            >
              <h2 id="spot-form-title" className="text-xl font-bold mb-2">
                {editId ? "スポット編集" : "新規スポット作成"}
              </h2>
              <label className="block font-bold" htmlFor="spot-name">
                温泉名
              </label>
              <input
                id="spot-name"
                className="w-full border rounded p-2"
                value={form.name || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                aria-label="温泉名"
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block font-bold" htmlFor="spot-lat">
                    緯度
                  </label>
                  <input
                    id="spot-lat"
                    type="number"
                    step="0.0001"
                    className="w-full border rounded p-2"
                    value={form.geo_lat ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        geo_lat: parseFloat(e.target.value),
                      }))
                    }
                    required
                    aria-label="緯度"
                  />
                </div>
                <div className="flex-1">
                  <label className="block font-bold" htmlFor="spot-lng">
                    経度
                  </label>
                  <input
                    id="spot-lng"
                    type="number"
                    step="0.0001"
                    className="w-full border rounded p-2"
                    value={form.geo_lng ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        geo_lng: parseFloat(e.target.value),
                      }))
                    }
                    required
                    aria-label="経度"
                  />
                </div>
              </div>
              <label className="block font-bold" htmlFor="spot-desc">
                説明
              </label>
              <textarea
                id="spot-desc"
                className="w-full border rounded p-2 min-h-[80px]"
                value={form.description || ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                aria-label="説明"
              />
              <label className="block font-bold" htmlFor="spot-tags">
                タグ（カンマ区切り）
              </label>
              <input
                id="spot-tags"
                className="w-full border rounded p-2"
                value={
                  Array.isArray(form.tags)
                    ? form.tags.join(",")
                    : form.tags || ""
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
                aria-label="タグ"
              />
              {error && (
                <div
                  className="text-red-500 text-sm"
                  data-testid="error-message"
                  aria-live="polite"
                >
                  {error}
                </div>
              )}
              <div className="flex gap-4 mt-4">
                <button
                  type="submit"
                  className="bg-primary-500 text-black px-6 py-2 rounded font-bold hover:bg-primary-700 transition"
                >
                  {editId ? "保存" : "登録"}
                </button>
                <button
                  type="button"
                  className="bg-gray-100 text-gray-700 px-6 py-2 rounded font-bold border hover:bg-red-100"
                  onClick={() => {
                    setShowForm(false);
                    setForm({});
                    setEditId(null);
                  }}
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        </Dialog>
      </div>
    </main>
  );
}
