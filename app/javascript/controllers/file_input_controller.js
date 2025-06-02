// 画像ファイル選択時にファイル名を表示するStimulusコントローラ
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["input", "label"];

  connect() {
    this.updateLabel();
  }

  // ファイル選択時に呼ばれる
  updateLabel() {
    if (!this.hasInputTarget || !this.hasLabelTarget) return;
    const files = this.inputTarget.files;
    if (!files || files.length === 0) {
      this.labelTarget.textContent = "選択されていません";
    } else {
      this.labelTarget.textContent = Array.from(files)
        .map((f) => f.name)
        .join(", ");
    }
  }
}
