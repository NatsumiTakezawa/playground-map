// @see rails/docs/ui_specification_tailwind.md
import { Controller } from "@hotwired/stimulus";

// デバッグ: ファイル読み込み確認
console.log("map_controller.js がロードされました");

// Google Maps API連携用 Stimulusコントローラ
export default class extends Controller {
  static targets = [];
  static values = { onsens: Array };

  connect() {
    console.log("MapController connected", this.element);
    this.onsens = JSON.parse(this.element.dataset.mapOnsens || "[]");
    // APIキー未設定時は地図を表示せずメッセージ
    const apiKey = window.GOOGLE_MAPS_API_KEY;
    if (!apiKey || apiKey === "replace_me" || apiKey.match(/^\s*$/)) {
      this.showNoMapMessage();
      return;
    }
    try {
      this.loadGoogleMaps();
      this.setupGeocodeButton();
    } catch (e) {
      this.showNoMapMessage("地図の初期化中にエラーが発生しました");
      // 他のUIは壊さない
    }
  }

  showNoMapMessage(msg = "地図は表示できません（APIキー未設定）") {
    this.element.innerHTML = `
      <div class="flex items-center justify-center h-full text-gray-500 bg-gray-100 rounded">
        <span>${msg}</span>
      </div>
    `;
  }

  loadGoogleMaps() {
    try {
      if (window.google && window.google.maps) {
        this.initMap();
        return;
      }
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${window.GOOGLE_MAPS_API_KEY}&callback=initMapFromStimulus`;
      script.async = true;
      window.initMapFromStimulus = () => {
        try {
          this.initMap();
        } catch (e) {
          this.showNoMapMessage("地図の描画に失敗しました");
        }
      };
      document.head.appendChild(script);
    } catch (e) {
      this.showNoMapMessage("地図の読み込みに失敗しました");
    }
  }

  initMap() {
    try {
      const center =
        this.onsens.length > 0
          ? {
              lat: parseFloat(this.onsens[0].geo_lat),
              lng: parseFloat(this.onsens[0].geo_lng),
            }
          : { lat: 35.472, lng: 133.05 };
      this.map = new google.maps.Map(this.element, {
        center: center,
        zoom: 11,
      });
      this.onsens.forEach((onsen) => {
        // google.maps.Markerは非推奨だがAPIキー無し時は何も起きない
        try {
          new google.maps.Marker({
            position: {
              lat: parseFloat(onsen.geo_lat),
              lng: parseFloat(onsen.geo_lng),
            },
            map: this.map,
            title: onsen.name,
          });
        } catch (e) {
          /* 無視 */
        }
      });
    } catch (e) {
      this.showNoMapMessage("地図の描画に失敗しました");
    }
  }

  locate() {
    if (!navigator.geolocation) {
      alert("Geolocation APIが利用できません");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        this.map.setCenter({ lat: latitude, lng: longitude });
        new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map: this.map,
          title: "現在地",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#00f",
            fillOpacity: 0.8,
            strokeWeight: 2,
          },
        });
      },
      () => alert("現在地の取得に失敗しました")
    );
  }

  setupGeocodeButton() {
    const btn = document.getElementById("geocode-btn");
    if (!btn) return;
    btn.addEventListener("click", async () => {
      const address = document.getElementById("address").value;
      if (!address) {
        alert("住所を入力してください");
        return;
      }
      try {
        const apiKey = window.GOOGLE_MAPS_API_KEY;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${apiKey}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === "OK") {
          const loc = data.results[0].geometry.location;
          document.querySelector("input[name='lat']").value = loc.lat;
          document.querySelector("input[name='lng']").value = loc.lng;
        } else {
          alert("ジオコーディング失敗: " + data.status);
        }
      } catch (e) {
        alert("ジオコーディング通信エラー");
      }
    });
  }
}
