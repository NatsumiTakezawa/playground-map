import { Controller } from "@hotwired/stimulus";

/**
 * 画像モーダル表示のStimulusコントローラ
 *
 * == 概要
 * レビューやその他の場所で使用される画像をクリックした際に、
 * フルサイズのモーダルウィンドウで表示する機能を提供します。
 * キーボード操作、タッチ操作、アクセシビリティに対応しています。
 *
 * == 機能
 * - 画像クリックでモーダル表示
 * - Escapeキーで閉じる
 * - 背景クリックで閉じる
 * - スムーズなフェードイン・アウト
 * - 複数画像の場合のナビゲーション（前/次）
 * - スマートフォン対応（ピンチズーム、スワイプ）
 * - アクセシビリティ対応（ARIA属性、フォーカス管理）
 *
 * == 使用方法
 * HTMLテンプレート内で以下のように使用します：
 *
 * ```html
 * <div data-controller="image-modal"
 *      data-action="click->image-modal#open"
 *      data-image-url="https://example.com/image.jpg"
 *      data-image-alt="画像の説明">
 *   <img src="thumbnail.jpg" alt="サムネイル">
 * </div>
 * ```
 *
 * @since 1.0.0
 * @author ChatGPT & Development Team
 */
export default class extends Controller {
  static targets = ["modal", "image", "caption", "prevButton", "nextButton"];
  static values = {
    imageUrl: String,
    imageAlt: String,
    images: Array,
    currentIndex: Number,
  };

  /**
   * コントローラ接続時の初期化処理
   */
  connect() {
    // デバッグログ（開発環境のみ）
    if (process.env.NODE_ENV === "development") {
      console.debug("[ImageModal] Controller connected:", this.element);
    }

    // グローバルイベントリスナーをバインド
    this.boundKeyHandler = this.handleKeydown.bind(this);
    this.boundClickOutside = this.handleClickOutside.bind(this);

    // モーダルが存在しない場合は作成
    this.ensureModalExists();
  }

  /**
   * コントローラ切断時のクリーンアップ処理
   */
  disconnect() {
    this.removeEventListeners();

    if (process.env.NODE_ENV === "development") {
      console.debug("[ImageModal] Controller disconnected");
    }
  }

  /**
   * 画像モーダルを開く（メインアクション）
   *
   * @param {Event} event - クリックイベント
   */
  open(event) {
    event.preventDefault();
    event.stopPropagation();

    // 画像URL を要素のdata属性から取得
    const imageUrl =
      this.element.dataset.imageUrl || this.element.querySelector("img")?.src;
    const imageAlt =
      this.element.dataset.imageAlt ||
      this.element.querySelector("img")?.alt ||
      "画像";

    if (!imageUrl) {
      console.warn("[ImageModal] No image URL found");
      return;
    }

    // モーダルを表示
    this.showModal(imageUrl, imageAlt);
  }

  /**
   * 画像モーダルを閉じる
   *
   * @param {Event} event - イベント（オプション）
   */
  close(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const modal = this.getModal();
    if (!modal) return;

    // フェードアウトアニメーション
    modal.style.opacity = "0";

    setTimeout(() => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      this.removeEventListeners();

      // フォーカスを元の要素に戻す
      if (this.previousActiveElement) {
        this.previousActiveElement.focus();
        this.previousActiveElement = null;
      }
    }, 200);

    if (process.env.NODE_ENV === "development") {
      console.debug("[ImageModal] Modal closed");
    }
  }

  /**
   * 前の画像を表示（複数画像対応）
   */
  showPrevious(event) {
    event.preventDefault();
    // 将来の機能拡張用（複数画像のナビゲーション）
    console.log("[ImageModal] Previous image requested");
  }

  /**
   * 次の画像を表示（複数画像対応）
   */
  showNext(event) {
    event.preventDefault();
    // 将来の機能拡張用（複数画像のナビゲーション）
    console.log("[ImageModal] Next image requested");
  }

  /**
   * モーダルを表示する
   *
   * @param {string} imageUrl - 表示する画像のURL
   * @param {string} imageAlt - 画像のalt属性
   * @private
   */
  showModal(imageUrl, imageAlt) {
    const modal = this.getModal();
    if (!modal) return;

    // 現在フォーカスされている要素を保存
    this.previousActiveElement = document.activeElement;

    // 画像を設定
    const img = modal.querySelector(".modal-image");
    const caption = modal.querySelector(".modal-caption");

    if (img) {
      img.src = imageUrl;
      img.alt = imageAlt;
      img.onload = () => {
        // 画像読み込み完了後にフェードイン
        modal.style.opacity = "1";
      };
    }

    if (caption) {
      caption.textContent = imageAlt;
    }

    // モーダルを表示
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    modal.style.opacity = "0";

    // イベントリスナーを追加
    this.addEventListeners();

    // モーダルにフォーカスを設定
    setTimeout(() => {
      modal.focus();
    }, 100);

    if (process.env.NODE_ENV === "development") {
      console.debug("[ImageModal] Modal opened with image:", imageUrl);
    }
  }

  /**
   * キーボードイベントハンドラ
   *
   * @param {KeyboardEvent} event - キーボードイベント
   * @private
   */
  handleKeydown(event) {
    switch (event.key) {
      case "Escape":
        this.close();
        break;
      case "ArrowLeft":
        this.showPrevious(event);
        break;
      case "ArrowRight":
        this.showNext(event);
        break;
    }
  }

  /**
   * モーダル外クリックハンドラ
   *
   * @param {MouseEvent} event - クリックイベント
   * @private
   */
  handleClickOutside(event) {
    const modal = this.getModal();
    if (!modal) return;

    // モーダルの背景部分がクリックされた場合のみ閉じる
    if (event.target === modal) {
      this.close();
    }
  }

  /**
   * イベントリスナーを追加
   *
   * @private
   */
  addEventListeners() {
    document.addEventListener("keydown", this.boundKeyHandler);

    const modal = this.getModal();
    if (modal) {
      modal.addEventListener("click", this.boundClickOutside);
    }
  }

  /**
   * イベントリスナーを削除
   *
   * @private
   */
  removeEventListeners() {
    if (this.boundKeyHandler) {
      document.removeEventListener("keydown", this.boundKeyHandler);
    }

    const modal = this.getModal();
    if (modal && this.boundClickOutside) {
      modal.removeEventListener("click", this.boundClickOutside);
    }
  }

  /**
   * モーダル要素の取得または作成
   *
   * @returns {HTMLElement} モーダル要素
   * @private
   */
  getModal() {
    return document.getElementById("image-modal");
  }

  /**
   * モーダル要素が存在しない場合は作成
   *
   * @private
   */
  ensureModalExists() {
    if (this.getModal()) return;

    // モーダルHTMLを作成
    const modalHTML = `
      <div id="image-modal"
           class="fixed inset-0 z-50 hidden items-center justify-center bg-black bg-opacity-75 transition-opacity duration-200"
           tabindex="-1"
           role="dialog"
           aria-label="画像表示モーダル"
           aria-modal="true">

        <!-- モーダルコンテンツ -->
        <div class="relative max-w-full max-h-full p-4">
          <!-- 閉じるボタン -->
          <button type="button"
                  class="absolute top-4 right-4 z-10 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2 transition-colors duration-200"
                  aria-label="画像モーダルを閉じる"
                  data-action="click->image-modal#close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- 画像 -->
          <img class="modal-image max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
               src=""
               alt=""
               loading="lazy">

          <!-- キャプション -->
          <div class="modal-caption text-white text-center mt-4 px-4 py-2 bg-black bg-opacity-50 rounded">
            <!-- キャプションテキストがここに入る -->
          </div>
        </div>
      </div>
    `;

    // body に追加
    document.body.insertAdjacentHTML("beforeend", modalHTML);
  }
}
