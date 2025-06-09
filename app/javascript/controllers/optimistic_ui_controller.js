import { Controller } from "@hotwired/stimulus";

/**
 * 楽観的UI更新Stimulusコントローラー
 *
 * == 概要
 * ユーザーアクションに対して即座に画面を更新し、
 * サーバーレスポンスを待たずに優れたUXを提供します。
 *
 * == 楽観的UIとは
 * ユーザーのアクションが成功すると仮定して、
 * サーバーからのレスポンスを待たずに画面を更新する手法。
 * 失敗した場合は元の状態に戻します。
 *
 * == 主な機能
 * - 即座のUI更新（レビュー投稿、いいね等）
 * - 失敗時の自動ロールバック
 * - ローディング状態の管理
 * - アクセシビリティサポート
 *
 * == 使用方法
 * <form data-controller="optimistic-ui"
 *       data-optimistic-ui-success-message-value="投稿完了！">
 *   <button data-action="click->optimistic-ui#submitOptimistically">
 *     送信
 *   </button>
 * </form>
 *
 * @example レビュー投稿での使用例
 *   data-controller="optimistic-ui"
 *   data-optimistic-ui-preview-text-value="レビューが投稿されました"
 *   data-action="submit->optimistic-ui#handleOptimisticSubmit"
 *
 * @author 松江市温泉マップ開発チーム
 * @since 1.0.0
 */
export default class extends Controller {
  // ターゲット要素の定義
  static targets = ["preview", "counter", "message"];

  // データ属性から取得可能な値の定義
  static values = {
    previewText: String,
    successMessage: String,
    errorMessage: String,
    previewTemplate: String,
    rollbackDelay: Number,
  };

  /**
   * コントローラー接続時の初期化処理
   *
   * 【初期化内容】
   * 1. デフォルト値の設定
   * 2. 元の状態の保存
   * 3. フォーム送信イベントの監視開始
   *
   * 【楽観的UIの準備】
   * - 現在の画面状態をスナップショット保存
   * - 予測される成功状態のプレビューを準備
   * - エラーハンドリング機能の有効化
   */
  connect() {
    console.log("OptimisticUI controller connected");

    // デフォルト値の設定
    this.setDefaultValues();

    // 元の状態を保存（ロールバック用）
    this.saveOriginalState();

    // フォーム送信の監視
    this.setupFormListeners();

    // 進行中の操作を追跡
    this.pendingOperations = new Set();
  }

  /**
   * コントローラー切断時のクリーンアップ
   */
  disconnect() {
    console.log("OptimisticUI controller disconnected");

    // 進行中の操作をすべてキャンセル
    this.pendingOperations.forEach((operation) => {
      clearTimeout(operation.timeoutId);
    });
    this.pendingOperations.clear();
  }

  /**
   * 楽観的レビュー投稿
   *
   * レビューフォーム送信時に即座にUIを更新し、
   * 成功を想定した状態を表示します。
   *
   * @param {Event} event - フォーム送信イベント
   */
  handleOptimisticSubmit(event) {
    const form = event.target;
    console.log("Starting optimistic review submission");

    // フォームデータの取得
    const formData = new FormData(form);
    const reviewData = this.extractReviewData(formData);

    // 楽観的UIの即座更新
    this.showOptimisticReview(reviewData);

    // 成功メッセージの表示
    this.showOptimisticMessage("success");

    // サーバーレスポンス監視の設定
    this.setupResponseHandlers(form, reviewData);
  }

  /**
   * 楽観的いいね機能
   *
   * いいねボタンクリック時に即座にカウンターを更新し、
   * サーバー確認後に最終状態を反映します。
   *
   * @param {Event} event - クリックイベント
   */
  handleOptimisticLike(event) {
    const button = event.currentTarget;
    const isLiked = button.classList.contains("liked");

    console.log(`Optimistic like ${isLiked ? "removal" : "addition"}`);

    // 即座にUIを更新
    this.updateLikeButton(button, !isLiked);

    // カウンターの更新
    this.updateLikeCounter(!isLiked);

    // サーバーへのリクエスト送信
    this.sendLikeRequest(button, !isLiked);
  }

  /**
   * 楽観的削除
   *
   * 削除ボタンクリック時に即座に要素をフェードアウトし、
   * サーバー確認後に完全削除または復元を行います。
   *
   * @param {Event} event - クリックイベント
   */
  handleOptimisticDelete(event) {
    const deleteButton = event.currentTarget;
    const targetElement = deleteButton.closest(
      "[data-optimistic-delete-target]"
    );

    if (!targetElement) return;

    console.log("Starting optimistic delete");

    // 確認ダイアログ（オプション）
    if (this.hasConfirmMessage && !confirm(this.confirmMessage)) {
      return;
    }

    // 即座にフェードアウト
    this.fadeOutElement(targetElement);

    // サーバーリクエストの送信
    this.sendDeleteRequest(deleteButton, targetElement);
  }

  // === プライベートメソッド ===

  /**
   * デフォルト値の設定
   */
  setDefaultValues() {
    if (!this.hasPreviewTextValue) {
      this.previewTextValue = "投稿中...";
    }
    if (!this.hasSuccessMessageValue) {
      this.successMessageValue = "操作が完了しました";
    }
    if (!this.hasErrorMessageValue) {
      this.errorMessageValue = "エラーが発生しました";
    }
    if (!this.hasRollbackDelayValue) {
      this.rollbackDelayValue = 10000; // 10秒
    }
  }

  /**
   * 元の状態を保存（ロールバック用）
   */
  saveOriginalState() {
    this.originalState = {
      html: this.element.innerHTML,
      reviewCount: this.getReviewCount(),
      likeCount: this.getLikeCount(),
    };
  }

  /**
   * フォーム送信イベントの監視設定
   */
  setupFormListeners() {
    const form = this.element.closest("form");
    if (!form) return;

    // Turbo Streamsのイベント監視
    form.addEventListener("turbo:submit-end", (event) => {
      this.handleServerResponse(event);
    });

    form.addEventListener("turbo:submit-error", (event) => {
      this.handleServerError(event);
    });
  }

  /**
   * レビューデータの抽出
   *
   * @param {FormData} formData - フォームデータ
   * @returns {Object} レビューデータオブジェクト
   */
  extractReviewData(formData) {
    return {
      rating: formData.get("review[rating]") || 0,
      comment: formData.get("review[comment]") || "",
      timestamp: new Date().toLocaleString("ja-JP"),
      author: "匿名", // 認証がないため固定
      images: formData.getAll("review[images]").filter((file) => file.size > 0),
    };
  }

  /**
   * 楽観的レビュー表示
   *
   * @param {Object} reviewData - レビューデータ
   */
  showOptimisticReview(reviewData) {
    const reviewsContainer = document.getElementById("reviews-list");
    if (!reviewsContainer) return;

    // 楽観的レビューのHTML生成
    const optimisticReview = this.createOptimisticReviewHTML(reviewData);

    // リストの先頭に追加（プレビュー状態として）
    reviewsContainer.insertAdjacentHTML("afterbegin", optimisticReview);

    // プレビュー要素にアニメーション適用
    const previewElement = reviewsContainer.querySelector(
      ".optimistic-preview"
    );
    if (previewElement) {
      previewElement.style.animation = "fadeInUp 0.3s ease-out";
    }

    // レビュー数カウンターの更新
    this.updateReviewCounter(1);
  }

  /**
   * 楽観的レビューのHTML生成
   *
   * @param {Object} reviewData - レビューデータ
   * @returns {string} レビューHTML
   */
  createOptimisticReviewHTML(reviewData) {
    return `
      <div class="optimistic-preview bg-blue-50 border-l-4 border-blue-400 p-4 mb-4 rounded-md opacity-75"
           data-optimistic-preview="true">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0">
            <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span class="text-white text-sm font-medium">新</span>
            </div>
          </div>
          <div class="flex-1">
            <div class="flex items-center space-x-2 mb-2">
              <span class="font-medium text-gray-900">${
                reviewData.author
              }</span>
              <div class="flex items-center">
                ${this.generateStarRating(reviewData.rating)}
              </div>
              <span class="text-sm text-blue-600 font-medium">投稿中...</span>
            </div>

            <p class="text-gray-700 text-sm mb-2">${reviewData.comment}</p>

            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>${reviewData.timestamp}</span>
              <div class="flex items-center space-x-1">
                <svg class="animate-spin h-3 w-3 text-blue-500" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>確認中</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 星評価のHTML生成
   *
   * @param {number} rating - 評価値（1-5）
   * @returns {string} 星評価HTML
   */
  generateStarRating(rating) {
    let stars = "";
    for (let i = 1; i <= 5; i++) {
      const filled = i <= rating ? "text-yellow-400" : "text-gray-300";
      stars += `<span class="${filled}">★</span>`;
    }
    return stars;
  }

  /**
   * 楽観的メッセージ表示
   *
   * @param {string} type - メッセージタイプ（success, error）
   */
  showOptimisticMessage(type) {
    const message =
      type === "success" ? this.successMessageValue : this.errorMessageValue;
    const alertClass =
      type === "success"
        ? "bg-green-50 border-green-200 text-green-800"
        : "bg-red-50 border-red-200 text-red-800";

    const alertHTML = `
      <div class="optimistic-alert ${alertClass} border p-3 rounded-md mb-4" data-optimistic-alert="true">
        <div class="flex items-center">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
          <span class="text-sm font-medium">${message}</span>
        </div>
      </div>
    `;

    const flashContainer = document.getElementById("flash-messages");
    if (flashContainer) {
      flashContainer.insertAdjacentHTML("afterbegin", alertHTML);

      // 自動削除（3秒後）
      setTimeout(() => {
        const alert = flashContainer.querySelector("[data-optimistic-alert]");
        if (alert) {
          alert.style.animation = "fadeOut 0.3s ease-out";
          setTimeout(() => alert.remove(), 300);
        }
      }, 3000);
    }
  }

  /**
   * レビューカウンターの更新
   *
   * @param {number} increment - 増減値
   */
  updateReviewCounter(increment) {
    const counter = document.getElementById("page-title-review-count");
    if (!counter) return;

    const currentText = counter.textContent;
    const currentCount = parseInt(currentText.match(/\d+/)?.[0] || "0");
    const newCount = currentCount + increment;

    counter.textContent = `（${newCount}件のレビュー）`;

    // アニメーション効果
    counter.style.animation = "pulse 0.3s ease-in-out";
  }

  /**
   * いいねボタンの更新
   *
   * @param {HTMLElement} button - いいねボタン
   * @param {boolean} isLiked - いいね状態
   */
  updateLikeButton(button, isLiked) {
    if (isLiked) {
      button.classList.add("liked", "text-red-500");
      button.classList.remove("text-gray-400");
    } else {
      button.classList.remove("liked", "text-red-500");
      button.classList.add("text-gray-400");
    }
  }

  /**
   * サーバーレスポンス処理
   *
   * @param {Event} event - Turboイベント
   */
  handleServerResponse(event) {
    console.log("Server response received");

    // 楽観的要素を削除
    this.removeOptimisticElements();

    // 成功時は実際のサーバーデータで画面更新
    // （Turbo Streamsが自動で行う）
  }

  /**
   * サーバーエラー処理
   *
   * @param {Event} event - Turboエラーイベント
   */
  handleServerError(event) {
    console.log("Server error occurred, rolling back optimistic changes");

    // 楽観的変更をロールバック
    this.rollbackChanges();

    // エラーメッセージの表示
    this.showOptimisticMessage("error");
  }

  /**
   * 楽観的要素の削除
   */
  removeOptimisticElements() {
    // プレビューレビューを削除
    const previewElements = document.querySelectorAll(
      "[data-optimistic-preview]"
    );
    previewElements.forEach((element) => {
      element.style.animation = "fadeOut 0.3s ease-out";
      setTimeout(() => element.remove(), 300);
    });

    // 楽観的アラートを削除
    const alerts = document.querySelectorAll("[data-optimistic-alert]");
    alerts.forEach((alert) => alert.remove());
  }

  /**
   * 変更のロールバック
   */
  rollbackChanges() {
    console.log("Rolling back optimistic changes");

    // プレビュー要素を削除
    this.removeOptimisticElements();

    // カウンターを元に戻す
    const counter = document.getElementById("page-title-review-count");
    if (counter && this.originalState.reviewCount !== undefined) {
      counter.textContent = `（${this.originalState.reviewCount}件のレビュー）`;
    }
  }

  /**
   * 現在のレビュー数を取得
   *
   * @returns {number} レビュー数
   */
  getReviewCount() {
    const counter = document.getElementById("page-title-review-count");
    if (!counter) return 0;
    return parseInt(counter.textContent.match(/\d+/)?.[0] || "0");
  }

  /**
   * 現在のいいね数を取得
   *
   * @returns {number} いいね数
   */
  getLikeCount() {
    // 将来的ないいね機能用
    return 0;
  }
}
