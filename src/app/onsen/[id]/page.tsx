/**
 * S01 温泉詳細ページ
 * @package MatsueOnsenMap
 * @module app/onsen/[id]/page
 */
import { supabase } from "@/lib/supabaseClient";
import PageClient from "./PageClient";
import type { Metadata } from "next";

/**
 * S01 温泉詳細ページ（サーバーコンポーネント化）
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { data: onsen } = await supabase
    .from("onsen")
    .select("*")
    .eq("id", id)
    .single();
  return {
    title: onsen
      ? `${onsen.name} | 松江市温泉マップ`
      : "温泉詳細 | 松江市温泉マップ",
    description:
      onsen?.description || "松江市周辺の温泉情報・レビュー・写真を掲載。",
    openGraph: {
      title: onsen
        ? `${onsen.name} | 松江市温泉マップ`
        : "温泉詳細 | 松江市温泉マップ",
      description:
        onsen?.description || "松江市周辺の温泉情報・レビュー・写真を掲載。",
      images:
        onsen?.images && onsen.images.length > 0 ? onsen.images : ["/file.svg"],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: onsen
        ? `${onsen.name} | 松江市温泉マップ`
        : "温泉詳細 | 松江市温泉マップ",
      description:
        onsen?.description || "松江市周辺の温泉情報・レビュー・写真を掲載。",
      images:
        onsen?.images && onsen.images.length > 0 ? onsen.images : ["/file.svg"],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // サーバーサイドで温泉データ・レビューを取得
  const { data: onsen, error: onsenError } = await supabase
    .from("onsen")
    .select("*")
    .eq("id", id)
    .single();
  if (onsenError || !onsen)
    return <div className="p-8 text-red-500">データ取得に失敗しました</div>;
  const { data: reviews } = await supabase
    .from("review")
    .select("*")
    .eq("onsen_id", id)
    .order("created_at", { ascending: false });

  // レビューに紐づくユーザー情報を取得
  let userMap: Record<string, { name: string; image_url?: string }> = {};
  if (reviews && reviews.length > 0) {
    const userIds = Array.from(
      new Set(reviews.map((r) => r.user_id).filter((id): id is string => !!id))
    );
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id, name")
        .in("id", userIds);
      if (users) {
        userMap = Object.fromEntries(
          users.map((u) => [
            u.id,
            { name: u.name || "匿名", image_url: undefined },
          ])
        );
      }
    }
  }

  return <PageClient onsen={onsen} reviews={reviews || []} userMap={userMap} />;
}
