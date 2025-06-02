// 評価用の星をクリックで選択できる Stimulus コントローラ
import { Controller } from "@hotwired/stimulus";

/**
 * @class RatingStarsController
 * @classdesc 星評価UIの制御
 */
export default class extends Controller {
  static targets = ["star", "input"];

  connect() {
    // 初期化時に選択状態を反映
    this.highlight(this.inputTarget.value);
  }

  /**
   * 星がクリックされたときに呼ばれる
   * @param {Event} event
   */
  select(event) {
    const value = event.currentTarget.dataset.value;
    this.inputTarget.value = value;
    this.highlight(value);
  }

  /**
   * 星のハイライトを更新
   * @param {string|number} value
   */
  highlight(value) {
    const v = parseInt(value, 10) || 0;
    this.starTargets.forEach((el, idx) => {
      if (idx < v) {
        el.classList.add("text-yellow-400");
        el.classList.remove("text-gray-300");
      } else {
        el.classList.add("text-gray-300");
        el.classList.remove("text-yellow-400");
      }
    });
  }
}
