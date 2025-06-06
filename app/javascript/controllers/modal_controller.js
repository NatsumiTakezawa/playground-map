/**
 * モーダルダイアログ制御 Stimulusコントローラー
 *
 * 【機能概要】
 * - モーダルダイアログの開閉管理
 * - フォーカストラップ（モーダル内でのタブ移動制限）
 * - Escapeキーでの閉じる操作
 * - 背景クリックでの閉じる操作
 * - アクセシビリティ対応
 *
 * 【HTMLでの使用例】
 * <div data-controller="modal"
 *      data-action="keydown.escape->modal#close click@window->modal#backdrop"
 *      class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
 *   <div class="bg-white rounded p-4">
 *     <button data-action="click->modal#close">閉じる</button>
 *   </div>
 * </div>
 *
 * 【学習ポイント】
 * - Stimulusのaction記法の活用
 * - DOM操作の基本（querySelectorAll、focus等）
 * - アクセシビリティ（フォーカス管理、キーボード操作）
 * - ユーザビリティ向上のためのUI制御
 */

import { Controller } from "@hotwired/stimulus";

/**
 * @class ModalController
 * @classdesc モーダルダイアログの表示・操作制御を担当するコントローラー
 */
export default class extends Controller {
  /**
   * モーダルがDOM要素に接続された時に自動実行
   *
   * 【処理内容】
   * 1. モーダル要素にフォーカスを設定
   * 2. フォーカストラップの初期化
   * 3. 初期フォーカスの設定
   *
   * 【アクセシビリティ】
   * モーダル表示時は画面読み上げソフトがモーダル内容を
   * 適切に読み上げるようにフォーカス管理を行う
   */
  connect() {
    console.log("ModalController connected");

    // モーダル要素自体にフォーカスを設定
    this.element.focus();

    // フォーカストラップを初期化
    this._initializeFocusTrap();

    // アクセシビリティ属性を設定
    this._setupAccessibilityAttributes();
  }

  /**
   * モーダルを閉じる
   *
   * 【使用例】
   * <button data-action="click->modal#close">閉じる</button>
   * <div data-action="keydown.escape->modal#close">...</div>
   *
   * 【処理内容】
   * 1. モーダル要素をDOMから削除
   * 2. 背景のスクロールロックを解除（将来実装予定）
   * 3. 元の要素にフォーカスを戻す（将来実装予定）
   */
  close() {
    console.log("モーダルを閉じます");

    // TODO: 将来の拡張ポイント
    // - クローズアニメーション
    // - フォーカスの復元
    // - body要素のスクロールロック解除

    this.element.remove();
  }

  /**
   * 背景クリック時の処理
   *
   * 【使用例】
   * <div data-action="click@window->modal#backdrop">
   *
   * 【処理ロジック】
   * - クリックされた要素がモーダルの背景（オーバーレイ）の場合のみ閉じる
   * - モーダル内のコンテンツがクリックされた場合は閉じない
   *
   * @param {Event} event - クリックイベントオブジェクト
   */
  backdrop(event) {
    // クリックされた要素がモーダルの最外側要素（背景）の場合のみ閉じる
    if (event.target === this.element) {
      console.log("背景クリックでモーダルを閉じます");
      this.close();
    }
  }

  // === プライベートメソッド（内部処理用） ===

  /**
   * フォーカストラップを初期化
   *
   * 【フォーカストラップとは】
   * モーダル表示中はTabキーでのフォーカス移動を
   * モーダル内の要素のみに制限する機能
   *
   * 【アクセシビリティの重要性】
   * 視覚障害者や キーボードのみで操作するユーザーが
   * モーダルの外に意図せずフォーカスが移動するのを防ぐ
   */
  _initializeFocusTrap() {
    // モーダル内のフォーカス可能な要素を取得
    const focusableElements = this._getFocusableElements();

    if (focusableElements.length > 0) {
      // 最初のフォーカス可能要素にフォーカスを設定
      focusableElements[0].focus();

      // TODO: 将来の拡張ポイント
      // - TabキーとShift+Tabキーでのループ制御
      // - 最後の要素から最初の要素への循環
      // - Shift+Tabで最初の要素から最後の要素への循環
    }
  }

  /**
   * モーダル内のフォーカス可能な要素を取得
   *
   * @returns {NodeList} フォーカス可能な要素のリスト
   *
   * 【対象要素】
   * - a: リンク
   * - button: ボタン
   * - textarea: テキストエリア
   * - input: 入力フィールド
   * - select: セレクトボックス
   * - [tabindex]: tabindex属性を持つ要素（-1以外）
   */
  _getFocusableElements() {
    const selector = [
      "a[href]", // リンク（href属性あり）
      "button:not([disabled])", // ボタン（無効化されていない）
      "textarea:not([disabled])", // テキストエリア（無効化されていない）
      'input:not([disabled]):not([type="hidden"])', // 入力フィールド（hidden以外）
      "select:not([disabled])", // セレクトボックス（無効化されていない）
      '[tabindex]:not([tabindex="-1"])', // tabindex指定要素（-1以外）
    ].join(", ");

    return this.element.querySelectorAll(selector);
  }

  /**
   * アクセシビリティ属性を設定
   *
   * 【設定する属性】
   * - role="dialog": ダイアログ要素であることを示す
   * - aria-modal="true": モーダルダイアログであることを示す
   * - aria-labelledby: ダイアログのタイトルを関連付け（将来実装）
   * - aria-describedby: ダイアログの説明を関連付け（将来実装）
   */
  _setupAccessibilityAttributes() {
    // ダイアログの役割を明示
    this.element.setAttribute("role", "dialog");
    this.element.setAttribute("aria-modal", "true");

    // tabindex="-1"を設定してプログラム的にフォーカス可能にする
    if (!this.element.hasAttribute("tabindex")) {
      this.element.setAttribute("tabindex", "-1");
    }

    // TODO: 将来の拡張ポイント
    // - aria-labelledby: モーダルタイトルとの関連付け
    // - aria-describedby: モーダル説明文との関連付け
    // - aria-hidden属性による背景要素の非表示化
  }
}
