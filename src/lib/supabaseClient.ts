/**
 * Supabaseクライアント初期化モジュール
 * @module lib/supabaseClient
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * プロジェクト共通のSupabaseクライアントインスタンス
 * @type {import('@supabase/supabase-js').SupabaseClient<Database>}
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
