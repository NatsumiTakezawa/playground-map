/**
 * Google Maps API連携 Stimulusコントローラー
 *
 * 【機能概要】
 * - Google Maps APIを使用して温泉スポットを地図上に表示
 * - 現在地取得機能（Geolocation API使用）
 * - 住所から緯度経度への変換（Geocoding API使用）
 * - APIキー未設定時の適切なフォールバック表示
 *
 * 【HTMLでの使用例】
 * <div data-controller="map" data-map-onsens='[{"name":"温泉名","geo_lat":35.0,"geo_lng":133.0}]'>
 * </div>
 *
 * 【学習ポイント】
 * - 外部APIとの連携方法
 * - 非同期処理（async/await）の使い方
 * - エラーハンドリングとユーザーフィードバック
 * - JavaScript DOM操作の基本
 *
 * @see rails/docs/ui_specification_tailwind.md
 */

import { Controller } from "@hotwired/stimulus";

/**
 * @class MapController
 * @classdesc Google Maps APIを使った地図表示・操作を担当するコントローラー
 */
export default class extends Controller {
  // Stimulusの設定: targetsとvaluesを定義
  static targets = [];
  static values = { onsens: Array };

  /**
   * コントローラーがDOM要素に接続された時に自動実行
   *
   * 【処理の流れ】
   * 1. 温泉データの取得・パース
   * 2. Google Maps APIキーの存在確認
   * 3. 地図の初期化またはエラーメッセージ表示
   * 4. 住所→座標変換ボタンのイベント設定
   */
  connect() {
    console.log("MapController connected");

    // HTML要素のdata属性から温泉データを取得
    this.onsens = this._parseOnsensData();

    // Google Maps APIキーの検証
    if (!this._isValidApiKey()) {
      this._showNoMapMessage("地図は表示できません（APIキー未設定）");
      return;
    }

    // 地図とジオコーディング機能を初期化
    try {
      this._initializeMap();
      this._setupGeocodeButton();
    } catch (error) {
      console.error("地図の初期化でエラー:", error);
      this._showNoMapMessage("地図の初期化中にエラーが発生しました");
    }
  }

  /**
   * 現在地を取得して地図に表示する
   *
   * 【使用例】
   * <button data-action="click->map#locate">現在地を表示</button>
   *
   * 【処理の流れ】
   * 1. ブラウザのGeolocation API対応確認
   * 2. 現在地座標の取得
   * 3. 地図の中心を現在地に移動
   * 4. 現在地マーカーの設置
   */
  locate() {
    // Geolocation APIの対応確認
    if (!navigator.geolocation) {
      this._showUserMessage("お使いのブラウザは位置情報機能に対応していません");
      return;
    }

    // 現在地取得のオプション設定
    const options = {
      enableHighAccuracy: true, // 高精度モード
      timeout: 10000, // 10秒でタイムアウト
      maximumAge: 300000, // 5分間はキャッシュを使用
    };

    navigator.geolocation.getCurrentPosition(
      (position) => this._onLocationSuccess(position),
      (error) => this._onLocationError(error),
      options
    );
  }

  // === プライベートメソッド（内部処理用） ===

  /**
   * HTML要素から温泉データを取得・パース
   * @returns {Array} 温泉データの配列
   */
  _parseOnsensData() {
    try {
      const rawData = this.element.dataset.mapOnsens || "[]";
      return JSON.parse(rawData);
    } catch (error) {
      console.warn("温泉データのパースに失敗:", error);
      return [];
    }
  }

  /**
   * Google Maps APIキーの妥当性をチェック
   * @returns {boolean} 有効なAPIキーの場合true
   */
  _isValidApiKey() {
    const apiKey = window.GOOGLE_MAPS_API_KEY;
    return apiKey && apiKey !== "replace_me" && !apiKey.match(/^\s*$/);
  }

  /**
   * 地図が表示できない場合のメッセージを表示
   * @param {string} message - 表示するメッセージ
   */
  _showNoMapMessage(message = "地図は表示できません") {
    this.element.innerHTML = `
      <div class="flex items-center justify-center h-full text-gray-500 bg-gray-100 rounded border-2 border-dashed border-gray-300">
        <div class="text-center p-4">
          <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p>${message}</p>
          <p class="text-sm mt-1">開発者: .env ファイルでGOOGLE_MAPS_API_KEYを設定してください</p>
        </div>
      </div>
    `;
  }

  /**
   * Google Maps APIの読み込みと地図の初期化
   */
  _initializeMap() {
    // 既にGoogle Maps APIが読み込まれている場合
    if (window.google && window.google.maps) {
      this._createMap();
      return;
    }

    // Google Maps APIを動的に読み込み
    this._loadGoogleMapsScript();
  }

  /**
   * Google Maps APIスクリプトを動的に読み込み
   */
  _loadGoogleMapsScript() {
    try {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${window.GOOGLE_MAPS_API_KEY}&callback=initMapFromStimulus`;
      script.async = true;
      script.defer = true;

      // APIロード完了時のコールバック関数をグローバルに設定
      window.initMapFromStimulus = () => {
        try {
          this._createMap();
        } catch (error) {
          console.error("地図の描画に失敗:", error);
          this._showNoMapMessage("地図の描画に失敗しました");
        }
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error("Google Maps APIの読み込みに失敗:", error);
      this._showNoMapMessage("地図の読み込みに失敗しました");
    }
  }

  /**
   * Google Maps地図を作成し、温泉マーカーを配置
   */
  _createMap() {
    try {
      // 地図の初期中心位置を決定
      const mapCenter = this._getMapCenter();

      // 地図インスタンスを作成
      this.map = new google.maps.Map(this.element, {
        center: mapCenter,
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        // UI要素の設定
        zoomControl: true,
        mapTypeControl: false,
        scaleControl: true,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: true,
      });

      // 温泉スポットのマーカーを配置
      this._addOnsenMarkers();
    } catch (error) {
      console.error("地図の作成に失敗:", error);
      this._showNoMapMessage("地図の描画に失敗しました");
    }
  }

  /**
   * 地図の初期中心位置を計算
   * @returns {Object} 緯度経度オブジェクト {lat: number, lng: number}
   */
  _getMapCenter() {
    if (this.onsens.length > 0) {
      // 温泉データがある場合は最初の温泉を中心にする
      return {
        lat: parseFloat(this.onsens[0].geo_lat),
        lng: parseFloat(this.onsens[0].geo_lng),
      };
    } else {
      // デフォルトは松江市の座標
      return { lat: 35.472, lng: 133.05 };
    }
  }

  /**
   * 温泉スポットのマーカーを地図に追加
   */
  _addOnsenMarkers() {
    this.onsens.forEach((onsen, index) => {
      try {
        // 各温泉の位置にマーカーを配置
        const marker = new google.maps.Marker({
          position: {
            lat: parseFloat(onsen.geo_lat),
            lng: parseFloat(onsen.geo_lng),
          },
          map: this.map,
          title: onsen.name,
          // マーカーアイコンをカスタマイズ（温泉らしい色にする）
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#ff6b6b", // 温泉らしい暖色
            fillOpacity: 0.8,
            strokeWeight: 2,
            strokeColor: "#ffffff",
          },
        });

        // マーカークリック時の情報ウィンドウ（今後の拡張ポイント）
        // この部分は将来的にInfoWindowで詳細情報を表示する予定
      } catch (error) {
        console.warn(`温泉マーカーの作成に失敗 (${onsen.name}):`, error);
      }
    });
  }

  /**
   * 現在地取得成功時の処理
   * @param {GeolocationPosition} position - 位置情報オブジェクト
   */
  _onLocationSuccess(position) {
    const { latitude, longitude } = position.coords;

    // 地図の中心を現在地に移動
    this.map.setCenter({ lat: latitude, lng: longitude });
    this.map.setZoom(14); // 現在地表示時はズームアップ

    // 現在地マーカーを配置
    const currentLocationMarker = new google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map: this.map,
      title: "現在地",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "#4285f4", // Google標準の青色
        fillOpacity: 0.8,
        strokeWeight: 3,
        strokeColor: "#ffffff",
      },
    });

    console.log("現在地を取得しました:", { latitude, longitude });
  }

  /**
   * 現在地取得失敗時の処理
   * @param {GeolocationPositionError} error - エラーオブジェクト
   */
  _onLocationError(error) {
    let message;

    switch (error.code) {
      case error.PERMISSION_DENIED:
        message = "位置情報の使用が許可されていません";
        break;
      case error.POSITION_UNAVAILABLE:
        message = "位置情報を取得できませんでした";
        break;
      case error.TIMEOUT:
        message = "位置情報の取得がタイムアウトしました";
        break;
      default:
        message = "位置情報の取得中にエラーが発生しました";
        break;
    }

    console.warn("現在地取得エラー:", error);
    this._showUserMessage(message);
  }

  /**
   * 住所→緯度経度変換ボタンのイベントリスナーを設定
   */
  _setupGeocodeButton() {
    const geocodeButton = document.getElementById("geocode-btn");
    if (!geocodeButton) {
      console.warn("ジオコーディングボタンが見つかりません");
      return;
    }

    geocodeButton.addEventListener("click", async (event) => {
      event.preventDefault();
      await this._performGeocoding();
    });
  }

  /**
   * 住所から緯度経度への変換を実行
   */
  async _performGeocoding() {
    const addressInput = document.getElementById("address");
    if (!addressInput) {
      this._showUserMessage("住所入力フィールドが見つかりません");
      return;
    }

    const address = addressInput.value.trim();
    if (!address) {
      this._showUserMessage("住所を入力してください");
      return;
    }

    try {
      // Google Geocoding APIを呼び出し
      const coordinates = await this._geocodeAddress(address);

      if (coordinates) {
        // 成功時: 緯度経度フィールドに値を設定
        this._updateCoordinateFields(coordinates);
        this._showUserMessage(`住所「${address}」の座標を取得しました`);
      } else {
        this._showUserMessage("住所から座標を取得できませんでした");
      }
    } catch (error) {
      console.error("ジオコーディングエラー:", error);
      this._showUserMessage("住所変換中にエラーが発生しました");
    }
  }

  /**
   * Google Geocoding APIを使って住所を緯度経度に変換
   * @param {string} address - 変換したい住所
   * @returns {Promise<Object|null>} 緯度経度オブジェクトまたはnull
   */
  async _geocodeAddress(address) {
    const apiKey = window.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return {
          lat: location.lat,
          lng: location.lng,
        };
      } else {
        console.warn("ジオコーディング失敗:", data.status);
        return null;
      }
    } catch (error) {
      console.error("ジオコーディング通信エラー:", error);
      throw error;
    }
  }

  /**
   * 緯度経度フィールドに値を設定
   * @param {Object} coordinates - 座標オブジェクト {lat: number, lng: number}
   */
  _updateCoordinateFields(coordinates) {
    const latField = document.querySelector("input[name='lat']");
    const lngField = document.querySelector("input[name='lng']");

    if (latField) latField.value = coordinates.lat;
    if (lngField) lngField.value = coordinates.lng;
  }

  /**
   * ユーザーにメッセージを表示
   * @param {string} message - 表示するメッセージ
   */
  _showUserMessage(message) {
    // 現在はalertを使用、将来的にはより洗練されたUIに変更予定
    alert(message);

    // TODO: トーストメッセージやモーダルダイアログでの表示に変更
    // 例: this._showToast(message); や this._showNotification(message);
  }
}
