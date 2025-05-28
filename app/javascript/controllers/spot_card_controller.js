// SpotCard用 Stimulusコントローラ
// @see rails/docs/ui_specification_tailwind.md
import { Controller } from "@hotwired/stimulus";

// data-controller="spot-card"
export default class extends Controller {
  static targets = ["card"];

  connect() {
    // 初期化処理
  }

  highlight() {
    this.element.classList.add("ring-2", "ring-blue-400", "shadow-lg");
  }

  unhighlight() {
    this.element.classList.remove("ring-2", "ring-blue-400", "shadow-lg");
  }
}
