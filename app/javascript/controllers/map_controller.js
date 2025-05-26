// @see rails/docs/ui_specification_tailwind.md
import { Controller } from "@hotwired/stimulus";

// Google Maps API連携用 Stimulusコントローラ
export default class extends Controller {
  static targets = [];
  static values = { onsens: Array };

  connect() {
    this.onsens = JSON.parse(this.element.dataset.mapOnsens || "[]");
    this.loadGoogleMaps();
  }

  loadGoogleMaps() {
    if (window.google && window.google.maps) {
      this.initMap();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${window.GOOGLE_MAPS_API_KEY}&callback=initMapFromStimulus`;
    script.async = true;
    window.initMapFromStimulus = this.initMap.bind(this);
    document.head.appendChild(script);
  }

  initMap() {
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
      new google.maps.Marker({
        position: {
          lat: parseFloat(onsen.geo_lat),
          lng: parseFloat(onsen.geo_lng),
        },
        map: this.map,
        title: onsen.name,
      });
    });
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
}
