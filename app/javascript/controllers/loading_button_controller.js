import { Controller } from "@hotwired/stimulus";

/**
 * ローディング状態管理Stimulusコントローラー
 *
 * == 概要
 * フォーム送信時にボタンのローディング状態を管理し、
 * ユーザーに視覚的フィードバックを提供します。
 *
 * == 主な機能
 * - ボタンクリック時のローディング状態開始
 * - ボタンテキストの動的変更
 * - 重複送信の防止
 * - アクセシビリティ配慮（aria-disabled等）
 *
 * == 使用方法
 * HTMLに以下のように記述：
 * <form data-controller="loading-button">
 *   <button data-loading-button-target="button"
 *           data-action="click->loading-button#startLoading">
 *     送信
 *   </button>
 * </form>
 *
 * == カスタマイズ可能なdata属性
 * - data-loading-button-loading-text: ローディング中のテキスト
 * - data-loading-button-loading-class: ローディング中のCSSクラス
 * - data-loading-button-disable-class: 無効化時のCSSクラス
 *
 * @example 基本的な使用例
 *   <button data-loading-button-target="button"
 *           data-action="click->loading-button#startLoading"
 *           data-loading-button-loading-text="処理中...">
 *     実行
 *   </button>
 *
 * @author 松江市温泉マップ開発チーム
 * @since 1.0.0
 */
export default class extends Controller {
  // ターゲット要素の定義
  static targets = ["button"];

  // データ属性から取得可能な値の定義
  static values = {
    loadingText: String,
    loadingClass: String,
    disableClass: String,
  };

  /**
   * コントローラー接続時の初期化処理
   *
   * 【初期化内容】
   * 1. 元のボタンテキストを保存
   * 2. デフォルト値の設定
   * 3. フォーム送信イベントの監視開始
   *
   * 【初学者向け解説】
   * - connect()はStimulusコントローラーが要素に接続された時に自動実行
   * - this.originalTexts で各ボタンの元テキストを保存
   * - addEventListener でフォーム送信を監視し、自動ローディング開始
   */
  connect() {
    console.log("LoadingButton controller connected");

    // 各ボタンの元のテキストを保存
    this.originalTexts = new Map();
    this.buttonTargets.forEach((button) => {
      this.originalTexts.set(button, button.textContent.trim());
    });

    // デフォルト値の設定
    this.setDefaultValues();

    // フォーム送信時の自動ローディング開始
    this.setupFormSubmitListener();
  }

  /**
   * コントローラー切断時のクリーンアップ
   *
   * メモリリークを防ぐためにイベントリスナーを削除し、
   * 状態をリセットします。
   */
  disconnect() {
    console.log("LoadingButton controller disconnected");

    // すべてのボタンのローディング状態を解除
    this.buttonTargets.forEach((button) => {
      this.resetButton(button);
    });

    // イベントリスナーのクリーンアップ
    if (this.form) {
      this.form.removeEventListener("submit", this.boundHandleSubmit);
    }
  }

  /**
   * ローディング状態開始
   *
   * ボタンクリック時に呼び出され、ローディング状態に移行します。
   *
   * @param {Event} event - クリックイベント
   *
   * 【処理内容】
   * 1. ボタンを無効化
   * 2. テキストをローディング用に変更
   * 3. CSSクラスを追加
   * 4. アクセシビリティ属性を設定
   */
  startLoading(event) {
    const button = event.currentTarget;
    console.log("Starting loading state for button:", button);

    // 既にローディング中の場合は処理しない
    if (button.hasAttribute("data-loading")) {
      event.preventDefault();
      return;
    }

    this.setLoadingState(button);
  }

  /**
   * ローディング状態終了
   *
   * プログラムから呼び出してローディング状態を解除します。
   *
   * @param {HTMLElement} button - 対象のボタン要素（省略時は全ボタン）
   */
  stopLoading(button = null) {
    if (button) {
      this.resetButton(button);
    } else {
      // 全ボタンのローディング状態を解除
      this.buttonTargets.forEach((btn) => this.resetButton(btn));
    }
  }

  /**
   * フォーム送信完了時の自動ローディング終了
   *
   * Turbo Streamsのレスポンス受信時などに呼び出され、
   * すべてのボタンのローディング状態を自動解除します。
   */
  handleFormResponse() {
    console.log("Form response received, stopping loading");
    this.stopLoading();
  }

  // === プライベートメソッド ===

  /**
   * デフォルト値の設定
   *
   * データ属性が未指定の場合のフォールバック値を設定します。
   */
  setDefaultValues() {
    if (!this.hasLoadingTextValue) {
      this.loadingTextValue = "処理中...";
    }
    if (!this.hasLoadingClassValue) {
      this.loadingClassValue = "opacity-75 cursor-not-allowed";
    }
    if (!this.hasDisableClassValue) {
      this.disableClassValue = "pointer-events-none";
    }
  }

  /**
   * フォーム送信イベントの監視設定
   *
   * フォーム送信時に自動でローディング状態を開始する仕組みを構築します。
   */
  setupFormSubmitListener() {
    this.form = this.element.closest("form");
    if (!this.form) return;

    this.boundHandleSubmit = this.handleSubmit.bind(this);
    this.form.addEventListener("submit", this.boundHandleSubmit);

    // Turbo Streamsのレスポンス監視
    this.form.addEventListener("turbo:submit-end", () => {
      this.handleFormResponse();
    });
  }

  /**
   * フォーム送信時の処理
   *
   * @param {Event} event - フォーム送信イベント
   */
  handleSubmit(event) {
    // 送信ボタンを特定してローディング状態にする
    const submitButton = this.buttonTargets.find(
      (button) => button.type === "submit" || button.form === this.form
    );

    if (submitButton) {
      this.setLoadingState(submitButton);
    }
  }

  /**
   * ボタンをローディング状態に設定
   *
   * @param {HTMLElement} button - 対象のボタン要素
   */
  setLoadingState(button) {
    // ローディング中フラグを設定
    button.setAttribute("data-loading", "true");

    // ボタンを無効化
    button.disabled = true;
    button.setAttribute("aria-disabled", "true");

    // テキストを変更
    const originalText =
      this.originalTexts.get(button) || button.textContent.trim();
    button.textContent = this.loadingTextValue;

    // CSSクラスを追加
    button.classList.add(...this.loadingClassValue.split(" "));
    button.classList.add(...this.disableClassValue.split(" "));

    // ローディングスピナーを追加（オプション）
    this.addLoadingSpinner(button);

    console.log(`Button "${originalText}" is now in loading state`);
  }

  /**
   * ボタンを元の状態にリセット
   *
   * @param {HTMLElement} button - 対象のボタン要素
   */
  resetButton(button) {
    // ローディング中フラグを削除
    button.removeAttribute("data-loading");

    // ボタンを有効化
    button.disabled = false;
    button.removeAttribute("aria-disabled");

    // 元のテキストに戻す
    const originalText = this.originalTexts.get(button);
    if (originalText) {
      button.textContent = originalText;
    }

    // CSSクラスを削除
    button.classList.remove(...this.loadingClassValue.split(" "));
    button.classList.remove(...this.disableClassValue.split(" "));

    // ローディングスピナーを削除
    this.removeLoadingSpinner(button);

    console.log(`Button "${originalText}" is now reset`);
  }

  /**
   * ローディングスピナーの追加
   *
   * @param {HTMLElement} button - 対象のボタン要素
   */
  addLoadingSpinner(button) {
    const spinner = document.createElement("span");
    spinner.innerHTML = `
      <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
           xmlns="http://www.w3.org/2000/svg"
           fill="none"
           viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    `;
    spinner.setAttribute("data-loading-spinner", "true");
    button.insertBefore(spinner, button.firstChild);
  }

  /**
   * ローディングスピナーの削除
   *
   * @param {HTMLElement} button - 対象のボタン要素
   */
  removeLoadingSpinner(button) {
    const spinner = button.querySelector("[data-loading-spinner]");
    if (spinner) {
      spinner.remove();
    }
  }
}
