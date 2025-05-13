import { createClient } from "@supabase/supabase-js";
import type { Database } from "../supabase.types";

// Onsen型
export type Onsen = Database["public"]["Tables"]["onsen"]["Row"];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 温泉スポットのDB操作サービス
 */
export const onsenService = {
  /** 一覧取得 */
  async list(): Promise<Onsen[]> {
    const { data, error } = await supabase
      .from("onsen")
      .select("*")
      .order("id");
    if (error) throw new Error(error.message);
    return data || [];
  },
  /** 新規作成 */
  async create(input: Omit<Onsen, "id">): Promise<Onsen> {
    const { data, error } = await supabase
      .from("onsen")
      .insert([input])
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
  /** 編集 */
  async update(id: string, input: Partial<Onsen>): Promise<Onsen> {
    const { data, error } = await supabase
      .from("onsen")
      .update(input)
      .eq("id", id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  },
  /** 削除 */
  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("onsen").delete().eq("id", id);
    if (error) throw new Error(error.message);
  },
  /**
   * CSV一括登録
   * @param rows CSVパース済みデータ配列
   */
  async bulkInsert(rows: Array<Partial<Onsen>>): Promise<void> {
    if (!Array.isArray(rows) || rows.length === 0) {
      return;
    }
    const { error } = await supabase.from("onsen").insert(rows);
    if (error) throw new Error(error.message);
  },
};
