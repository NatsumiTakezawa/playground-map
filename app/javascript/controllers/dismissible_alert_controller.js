import { Controller } from "@hotwired/stimulus";

/**
 * 閉じることができるアラートメッセージのStimulusコントローラ
 *
 * == 概要
 * アラートメッセージ（エラー、成功、警告、情報）を閉じる機能を提供します。
 * アクセシビリティに配慮し、キーボード操作とスクリーンリーダー対応を含みます。
 *
 * == 使用方法
 * HTMLテンプレート内で以下のように使用します：
 *
 * ```html
 * <div data-controller="dismissible-alert">
 *   <!-- アラート内容 -->
 *   <button data-action="click->dismissible-alert#dismiss">×</button>
 * </div>
 * ```
 *
 * == 機能
 * - クリックでアラートを閉じる
 * - Escapeキーでアラートを閉じる
 * - フェードアウトアニメーション
 * - アクセシビリティ対応（ARIA属性）
 *
 * @since 1.0.0
 * @author ChatGPT & Development Team
 */
export default class extends Controller {
  static targets = [];

  /**
   * コントローラ接続時の初期化処理
   *
   * - Escapeキーイベントリスナーを設定
   * - アクセシビリティ属性を確認・設定
   */
  connect() {
    // デバッグログ（開発環境のみ）
    if (process.env.NODE_ENV === "development") {
      console.debug("[DismissibleAlert] Controller connected:", this.element);
    }

    // Escapeキーでアラートを閉じる機能を追加
    this.boundEscapeHandler = this.handleEscape.bind(this);
    document.addEventListener("keydown", this.boundEscapeHandler);

    // アクセシビリティ属性の確認と設定
    this.ensureAccessibilityAttributes();
  }

  /**
   * コントローラ切断時のクリーンアップ処理
   *
   * - イベントリスナーを削除してメモリリークを防ぐ
   */
  disconnect() {
    // Escapeキーイベントリスナーを削除
    if (this.boundEscapeHandler) {
      document.removeEventListener("keydown", this.boundEscapeHandler);
      this.boundEscapeHandler = null;
    }

    if (process.env.NODE_ENV === "development") {
      console.debug("[DismissibleAlert] Controller disconnected");
    }
  }

  /**
   * アラートメッセージを閉じる（メインアクション）
   *
   * - フェードアウトアニメーション付きでアラートを削除
   * - アクセシビリティのためにスクリーンリーダーに通知
   *
   * @param {Event} event - クリックイベント（オプション）
   */
  dismiss(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // アラートタイプを取得（ログ用）
    const alertType = this.element.dataset.alertType || "unknown";

    if (process.env.NODE_ENV === "development") {
      console.debug(
        `[DismissibleAlert] Dismissing alert of type: ${alertType}`
      );
    }

    // スクリーンリーダーへの通知
    this.announceToScreenReader("アラートメッセージが閉じられました");

    // フェードアウトアニメーション
    this.fadeOutAndRemove();
  }

  /**
   * Escapeキーハンドラ
   *
   * - Escapeキーが押された時にアラートを閉じる
   * - 現在フォーカスされている要素がこのアラート内にある場合のみ反応
   *
   * @param {KeyboardEvent} event - キーボードイベント
   * @private
   */
  handleEscape(event) {
    if (event.key === "Escape" || event.keyCode === 27) {
      // フォーカスがこのアラート内にあるかチェック
      if (this.element.contains(document.activeElement)) {
        this.dismiss(event);
      }
    }
  }

  /**
   * フェードアウトアニメーション付きでアラートを削除
   *
   * - CSS transitionを使用してスムーズなアニメーション
   * - アニメーション完了後にDOMから要素を削除
   *
   * @private
   */
  fadeOutAndRemove() {
    // CSS transitionのための準備
    this.element.style.transition =
      "opacity 0.3s ease-out, transform 0.3s ease-out";
    this.element.style.transformOrigin = "top";

    // フェードアウト開始
    requestAnimationFrame(() => {
      this.element.style.opacity = "0";
      this.element.style.transform = "scaleY(0.8)";
    });

    // アニメーション完了後に要素を削除
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.remove();
      }
    }, 300); // 0.3秒後に削除
  }

  /**
   * スクリーンリーダーに対してメッセージを通知
   *
   * - aria-live領域を一時的に作成してメッセージを通知
   * - 通知後は要素を削除してDOMを汚染しない
   *
   * @param {string} message - 通知するメッセージ
   * @private
   */
  announceToScreenReader(message) {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only"; // スクリーンリーダーのみに表示
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // 短時間後に削除（スクリーンリーダーが読み上げた後）
    setTimeout(() => {
      if (announcement.parentNode) {
        announcement.remove();
      }
    }, 1000);
  }

  /**
   * アクセシビリティ属性の確認と設定
   *
   * - 必要なARIA属性が設定されているかチェック
   * - 不足している属性があれば自動設定
   *
   * @private
   */
  ensureAccessibilityAttributes() {
    // role属性の確認
    if (!this.element.getAttribute("role")) {
      this.element.setAttribute("role", "alert");
      console.warn('[DismissibleAlert] Added missing role="alert" attribute');
    }

    // aria-live属性の確認
    if (!this.element.getAttribute("aria-live")) {
      this.element.setAttribute("aria-live", "polite");
      console.warn(
        '[DismissibleAlert] Added missing aria-live="polite" attribute'
      );
    }

    // tabindex を設定してキーボードフォーカス可能にする
    if (!this.element.getAttribute("tabindex")) {
      this.element.setAttribute("tabindex", "-1");
    }
  }
}
