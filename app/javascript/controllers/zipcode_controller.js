// 郵便番号→住所自動入力 Stimulusコントローラ
// @see https://zipcloud.ibsnet.co.jp/doc/api
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["zipcode", "address"];

  // ボタン要素取得
  get button() {
    return this.element.querySelector("#zipcode-search-btn");
  }

  // スピナーHTML
  spinner() {
    return '<svg class="inline w-4 h-4 mr-1 animate-spin text-blue-500" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg>';
  }

  connect() {
    // ZipcodeController is ready
  }

  // 郵便番号から住所を取得し、address欄にセット
  search() {
    const zipcode = this.zipcodeTarget.value.replace(/[^0-9]/g, "");

    if (!zipcode.match(/^\d{7}$/)) {
      alert("郵便番号は7桁の数字で入力してください。");
      return;
    }

    // アニメーション: ボタンを押した感
    this.button.classList.add(
      "scale-95",
      "bg-blue-200",
      "transition",
      "duration-150"
    );
    setTimeout(() => {
      this.button.classList.remove("scale-95", "bg-blue-200");
    }, 150);

    // スピナー表示・ボタン無効化
    const originalHTML = this.button.innerHTML;
    this.button.innerHTML = this.spinner() + "住所自動入力";
    this.button.disabled = true;
    this.button.classList.add("opacity-50", "cursor-wait");

    fetch(`https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.results && data.results[0]) {
          const r = data.results[0];
          this.addressTarget.value = `${r.address1}${r.address2}${r.address3}`;

          // 成功時の通知（控えめに）
          this.showSuccessMessage();
        } else {
          alert("該当する住所が見つかりませんでした。");
        }
      })
      .catch(() => alert("住所検索に失敗しました。"))
      .finally(() => {
        this.button.innerHTML = "住所自動入力";
        this.button.disabled = false;
        this.button.classList.remove("opacity-50", "cursor-wait");
      });
  }

  // 成功時のメッセージ表示（アラートの代わりに控えめな通知）
  showSuccessMessage() {
    // 一時的な成功メッセージを表示
    const message = document.createElement("div");
    message.textContent = "住所を自動入力しました";
    message.className =
      "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50 transition-opacity duration-300";

    document.body.appendChild(message);

    // 3秒後にフェードアウト
    setTimeout(() => {
      message.classList.add("opacity-0");
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 300);
    }, 3000);
  }
}
