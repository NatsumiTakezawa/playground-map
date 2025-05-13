import { createClient } from '@supabase/supabase-js';
import { Onsen } from '../supabase.types';

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
    const { data, error } = await supabase.from('Onsen').select('*').order('id');
    if (error) throw new Error(error.message);
    return data || [];
  },
  /** 新規作成 */
  async create(input: Omit<Onsen, 'id'>): Promise<Onsen> {
    const { data, error } = await supabase.from('Onsen').insert([input]).select().single();
    if (error) throw new Error(error.message);
    return data;
  },
  /** 編集 */
  async update(id: number, input: Partial<Onsen>): Promise<Onsen> {
    const { data, error } = await supabase.from('Onsen').update(input).eq('id', id).select().single();
    if (error) throw new Error(error.message);
    return data;
  },
  /** 削除 */
  async remove(id: number): Promise<void> {
    const { error } = await supabase.from('Onsen').delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};
