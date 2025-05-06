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
    if (!mapRef.current) return;
    // Google Maps APIが未ロードならスクリプトを動的追加
    if (!window.google || !window.google.maps) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = () => {
        initMap();
      };
      document.body.appendChild(script);
    } else {
      initMap();
    }
    function initMap() {
      if (!mapRef.current) return;
      if (!mapInstance.current) {
        mapInstance.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: 35.4723, lng: 133.0505 }, // 松江しんじ湖温泉を中心
          zoom: 12,
          mapTypeControl: false,
          streetViewControl: false,
        });
      }
      // 既存マーカーをクリア
      markers.current.forEach((m) => m.setMap(null));
      markers.current = [];
      // 温泉ごとにマーカーを追加
      onsens.forEach((onsen) => {
        if (!onsen.geo_lat || !onsen.geo_lng) return;
        const marker = new window.google.maps.Marker({
          position: { lat: onsen.geo_lat, lng: onsen.geo_lng },
          map: mapInstance.current!,
          title: onsen.name,
        });
        markers.current.push(marker);
      });
    }
    // クリーンアップ
    return () => {
      markers.current.forEach((m) => m.setMap(null));
      markers.current = [];
    };
  }, [onsens]);

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
