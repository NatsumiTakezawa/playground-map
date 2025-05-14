"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Database } from "@/lib/supabase.types";
import { MapView } from "@/components/MapView";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Image from "next/image";

/**
 * 温泉データ型（Supabase型から抽出）
 */
type Onsen = Database["public"]["Tables"]["onsen"]["Row"];

/**
 * Google Mapsのスケルトン表示用コンポーネント
 */
function MapSkeleton() {
  return (
    <div className="w-full h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
      <span className="text-gray-500">Loading Map...</span>
    </div>
  );
}

/**
 * 温泉カードリストのスケルトン
 */
function SpotCardListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-lg" />
      ))}
    </div>
  );
}

/**
 * 温泉カード
 */
function SpotCard({ onsen }: { onsen: Onsen }) {
  const router = useRouter();
  if (!onsen) return null;
  const thumb =
    onsen.images && onsen.images.length > 0 ? onsen.images[0] : "/file.svg";
  return (
    <Card
      className="w-full cursor-pointer hover:shadow-lg transition"
      tabIndex={0}
      role="button"
      aria-label={`${onsen.name}の詳細ページへ`}
      onClick={() => router.push(`/onsen/${onsen.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          router.push(`/onsen/${onsen.id}`);
        }
      }}
    >
      <CardHeader className="flex flex-row items-center gap-3">
        <Image
          src={thumb}
          alt={onsen.name + "のサムネイル"}
          width={56}
          height={56}
          className="rounded object-cover border w-14 h-14 bg-gray-100"
        />
        <CardTitle>{onsen.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-600 line-clamp-2 mb-2">
          {onsen.description}
        </div>
        <div className="flex flex-wrap gap-1">
          {(onsen.tags || []).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded"
            >
              #{tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * メインページ（S00 トップ/温泉マップ）
 */
export default function HomePage() {
  const [onsens, setOnsens] = useState<Onsen[] | null>(null);

  useEffect(() => {
    /**
     * Supabaseから温泉データを取得
     */
    async function fetchOnsens() {
      const { data, error } = await supabase
        .from("onsen")
        .select(
          "id, name, geo_lat, geo_lng, description, tags, images, created_at"
        );
      if (error) {
        // TODO: エラーハンドリング（トースト等）
        setOnsens([]);
        return;
      }
      setOnsens(data ?? []);
    }
    fetchOnsens();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 bg-primary-50">
        {/* MapView（左） */}
        <div className="md:w-3/5 w-full mb-4 md:mb-0">
          {onsens === null ? <MapSkeleton /> : <MapView onsens={onsens} />}
        </div>
        {/* SpotCardList（右） */}
        <div className="md:w-2/5 w-full">
          <h2 className="font-bold text-xl mb-2">温泉一覧</h2>
          {onsens === null ? (
            <SpotCardListSkeleton />
          ) : (
            <div className="space-y-4">
              {onsens.map((onsen: Onsen) => (
                <SpotCard key={onsen.id} onsen={onsen} />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* BannerAd（フッター直上） */}
      <div className="w-full flex justify-center py-4">
        <div className="w-full max-w-2xl h-20 bg-gradient-to-r from-primary-100 to-primary-50 rounded-lg flex items-center justify-center text-primary-700 font-semibold">
          広告バナー（サンプル）
        </div>
      </div>
      {/* Footer */}
      <footer className="w-full text-center text-xs text-gray-500 py-2 border-t bg-white">
        © 2025 松江市温泉マップ
      </footer>
    </div>
  );
}
