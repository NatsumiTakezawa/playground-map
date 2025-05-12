/**
 * MapView（Google Maps + 温泉マーカー表示）
 * @package MatsueOnsenMap
 * @module components/MapView
 */
import { useEffect, useRef } from "react";
import type { Database } from "@/lib/supabase.types";

/**
 * 温泉データ型
 */
type Onsen = Database["public"]["Tables"]["onsen"]["Row"];

export type MapViewProps = {
  onsens: Onsen[];
};

/**
 * Google Mapsを表示し、温泉マーカーを描画するコンポーネント
 *
 * @param {Onsen[]} onsens - 地図上に表示する温泉データ配列
 */
export function MapView({ onsens }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    const apiKey =
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
      process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      mapRef.current.innerHTML = ""; // 直接エラー文をDOMに入れずJSXで表示
      return;
    }
    const w = window as typeof window & { google?: typeof google };
    if (w.google && w.google.maps) {
      initMap();
      return;
    }
    if (document.getElementById("google-maps-script")) return;
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initMap();
    };
    document.body.appendChild(script);
    function initMap() {
      if (!mapRef.current) return;
      if (!mapInstance.current) {
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center: { lat: 35.4723, lng: 133.0505 }, // 松江しんじ湖温泉を中心
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
        });
      }
      markers.current.forEach((m) => m.setMap(null));
      markers.current = [];
      onsens.forEach((onsen) => {
        if (!onsen.geo_lat || !onsen.geo_lng) return;
        // TODO: AdvancedMarkerElementへの移行検討
        const marker = new google.maps.Marker({
          position: { lat: onsen.geo_lat, lng: onsen.geo_lng },
          map: mapInstance.current!,
          title: onsen.name,
        });
        markers.current.push(marker);
      });
    }
    return () => {
      markers.current.forEach((m) => m.setMap(null));
      markers.current = [];
    };
  }, [onsens]);

  const apiKey =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
        process.env.GOOGLE_MAPS_API_KEY
      : undefined;

  if (!apiKey) {
    return (
      <div
        className="w-full h-[400px] rounded-lg border border-red-200 bg-red-50 flex flex-col items-center justify-center text-red-700 gap-2"
        aria-label="温泉マップ"
        tabIndex={0}
      >
        <svg
          width="40"
          height="40"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" fill="#fee2e2" />
          <path
            d="M12 8v4m0 4h.01"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="font-bold text-lg">Google Mapsが表示できません</div>
        <div className="text-sm">
          APIキーが設定されていません。
          <br />
          管理者にお問い合わせください。
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-[400px] rounded-lg border border-gray-200 bg-gray-100"
      aria-label="温泉マップ"
      tabIndex={0}
    />
  );
}

export default MapView;
