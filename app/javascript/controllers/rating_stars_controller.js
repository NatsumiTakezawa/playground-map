/**
 * 評価用星（★）UIコントローラー
 *
 * 【機能概要】
 * - 1〜5個の星を表示し、クリックで評価を選択
 * - 選択された評価値をhidden inputに保存
 * - 視覚的フィードバック（選択された星は黄色、未選択は灰色）
 *
 * 【HTMLでの使用例】
 * <div data-controller="rating-stars">
 *   <span data-rating-stars-target="star" data-value="1">★</span>
 *   <span data-rating-stars-target="star" data-value="2">★</span>
 *   ...
 *   <input type="hidden" data-rating-stars-target="input" name="review[rating]" />
 * </div>
 *
 * 【学習ポイント】
 * - Stimulusのtargets機能による要素の管理
 * - CSSクラスの動的切り替え
 * - イベントハンドリングとデータ属性の活用
 */

import { Controller } from "@hotwired/stimulus";

/**
 * @class RatingStarsController
 * @classdesc 星評価UIの制御を担当するStimulusコントローラー
 */
export default class extends Controller {
  // Stimulusが管理する要素を定義
  static targets = ["star", "input"];

  /**
   * コントローラーがDOM要素に接続された時に自動実行
   *
   * 【処理の流れ】
   * 1. hidden inputの現在値を確認
   * 2. その値に基づいて星の表示状態を初期化
   *
   * 【初学者への解説】
   * connect()は Stimulus のライフサイクルメソッドの一つ。
   * ページ読み込み時や、動的にHTML要素が追加された時に自動で呼ばれる。
   */
  connect() {
    console.log("RatingStarsController connected");

    // 現在の評価値（hidden inputの値）を取得して星の状態を初期化
    const currentValue = this.inputTarget.value;
    this.updateStarDisplay(currentValue);
  }

  /**
   * 星がクリックされた時のイベントハンドラー
   *
   * @param {Event} event - クリックイベントオブジェクト
   *
   * 【処理の流れ】
   * 1. クリックされた星のdata-value属性から評価値を取得
   * 2. hidden inputに評価値を設定
   * 3. 全ての星の表示状態を更新
   *
   * 【HTMLでの使用例】
   * <span data-action="click->rating-stars#select" data-value="3">★</span>
   */
  select(event) {
    try {
      // クリックされた星の評価値を取得
      const selectedValue = event.currentTarget.dataset.value;

      // バリデーション：値が1-5の範囲内かチェック
      if (!this._isValidRating(selectedValue)) {
        console.warn("無効な評価値:", selectedValue);
        return;
      }

      // hidden inputに選択された評価値を設定
      this.inputTarget.value = selectedValue;

      // 星の表示状態を更新
      this.updateStarDisplay(selectedValue);

      // ユーザーに選択が完了したことを視覚的に伝える
      this._provideFeedback(selectedValue);
    } catch (error) {
      console.error("星の選択処理でエラーが発生:", error);
    }
  }

  /**
   * 星の表示状態を更新する（プライベートメソッド）
   *
   * @param {string|number} selectedValue - 選択された評価値
   *
   * 【処理ロジック】
   * - 選択値以下の星: 黄色（text-yellow-400）
   * - 選択値より大きい星: 灰色（text-gray-300）
   *
   * 【CSS クラスの管理】
   * add() と remove() を使ってTailwindのクラスを動的に切り替え
   */
  updateStarDisplay(selectedValue) {
    const numericValue = parseInt(selectedValue, 10) || 0;

    this.starTargets.forEach((starElement, index) => {
      // 配列のindexは0から始まるので、星の番号は index + 1
      const starNumber = index + 1;

      if (starNumber <= numericValue) {
        // 選択された評価以下の星を黄色にする
        this._setStarActive(starElement);
      } else {
        // 選択された評価より大きい星を灰色にする
        this._setStarInactive(starElement);
      }
    });
  }

  // === プライベートメソッド（内部処理用） ===

  /**
   * 評価値の妥当性をチェック
   * @param {string|number} value - チェック対象の値
   * @returns {boolean} 1-5の範囲内の場合true
   */
  _isValidRating(value) {
    const num = parseInt(value, 10);
    return num >= 1 && num <= 5;
  }

  /**
   * 星を選択状態（黄色）にする
   * @param {HTMLElement} starElement - 対象の星要素
   */
  _setStarActive(starElement) {
    starElement.classList.add("text-yellow-400");
    starElement.classList.remove("text-gray-300");
    // アクセシビリティ: 選択状態を示す
    starElement.setAttribute("aria-selected", "true");
  }

  /**
   * 星を非選択状態（灰色）にする
   * @param {HTMLElement} starElement - 対象の星要素
   */
  _setStarInactive(starElement) {
    starElement.classList.add("text-gray-300");
    starElement.classList.remove("text-yellow-400");
    // アクセシビリティ: 非選択状態を示す
    starElement.setAttribute("aria-selected", "false");
  }

  /**
   * 選択完了の視覚的フィードバックを提供
   * @param {string|number} value - 選択された評価値
   */
  _provideFeedback(value) {
    // 開発環境では選択値をコンソールに出力
    console.log(`評価が選択されました: ${value}星`);

    // 将来的にはここにアニメーション効果や音声フィードバックを追加可能
    // 例: this._animateSelection(); や this._playFeedbackSound();
  }
}
