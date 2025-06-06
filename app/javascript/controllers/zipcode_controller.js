/**
 * 郵便番号→住所自動入力 Stimulusコントローラ
 *
 * == 初学者向け解説 ==
 * このコントローラは、郵便番号入力から自動的に住所を取得する機能を提供します。
 * 外部API（zipcloud.ibsnet.co.jp）を使用して、日本全国の住所データを検索します。
 *
 * == 主要機能 ==
 * 1. 郵便番号バリデーション（7桁数字チェック）
 * 2. 外部API呼び出しによる住所取得
 * 3. ユーザーフレンドリーなローディング表示
 * 4. エラーハンドリングと成功時通知
 *
 * == Stimulusパターンの学習ポイント ==
 * - Targetsによる要素の取得・制御
 * - fetchAPIを使った非同期通信
 * - DOMの動的操作とアニメーション
 * - エラーハンドリングのベストプラクティス
 *
 * @see https://zipcloud.ibsnet.co.jp/doc/api ZIP Cloud API仕様
 * @see https://stimulus.hotwired.dev/ Stimulus公式ドキュメント
 * @since 1.0.0
 */
import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  /**
   * Stimulus Target設定
   * data-zipcode-target="zipcode" および data-zipcode-target="address" と連携
   */
  static targets = ["zipcode", "address"];

  /**
   * DOM要素の動的取得：検索ボタン
   * @returns {HTMLElement} 検索ボタン要素
   * @note 毎回DOM検索を行うため、頻繁な呼び出しには注意
   */
  get button() {
    return this.element.querySelector("#zipcode-search-btn");
  }

  /**
   * ローディング表示用のSVGスピナー
   * @returns {string} SVGアニメーションのHTML文字列
   * @note Tailwind CSSのanimate-spinクラスを使用
   */
  spinner() {
    return (
      '<svg class="inline w-4 h-4 mr-1 animate-spin text-blue-500" viewBox="0 0 24 24">' +
      '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>' +
      '<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>' +
      "</svg>"
    );
  }

  /**
   * Stimulusライフサイクル：コントローラ初期化時
   * @note DOM要素の初期設定やイベントリスナー設定に使用
   */
  connect() {
    console.log("ZipcodeController: 郵便番号検索機能が初期化されました");
  }

  /**
   * メイン機能：郵便番号から住所を検索・自動入力
   *
   * == 処理フロー ==
   * 1. 郵便番号の入力値検証（7桁数字チェック）
   * 2. UI更新（ボタン無効化・ローディング表示）
   * 3. 外部API呼び出し（ZIP Cloud API）
   * 4. 取得結果の住所欄への反映
   * 5. UI復元（ボタン再有効化・成功通知）
   *
   * @public データ属性data-action="click->zipcode#search"により呼び出し
   */
  search() {
    // Step 1: 郵便番号の正規化とバリデーション
    const zipcode = this.zipcodeTarget.value.replace(/[^0-9]/g, "");

    if (!zipcode.match(/^\d{7}$/)) {
      alert("郵便番号は7桁の数字で入力してください（例：6900874）");
      return;
    }

    // Step 2: ボタンクリック時の視覚フィードバック
    this._showClickAnimation();

    // Step 3: ローディング状態に移行
    this._showLoadingState();

    // Step 4: 外部API呼び出しと結果処理
    this._fetchAddressFromAPI(zipcode);
  }

  /**
   * プライベート：ボタンクリック時のアニメーション効果
   * @private
   * @note 押した感を演出し、ユーザビリティを向上
   */
  _showClickAnimation() {
    this.button.classList.add(
      "scale-95", // 少し縮小
      "bg-blue-200", // 背景色変更
      "transition", // スムーズなアニメーション
      "duration-150" // 150msの短時間
    );

    // 150ms後に元の状態に戻す
    setTimeout(() => {
      this.button.classList.remove("scale-95", "bg-blue-200");
    }, 150);
  }

  /**
   * プライベート：ローディング状態のUI表示
   * @private
   * @note API処理中であることをユーザーに明示
   */
  _showLoadingState() {
    // 元のボタンテキストを保存
    this.originalButtonText = this.button.innerHTML;

    // ローディング表示に変更
    this.button.innerHTML = this.spinner() + "住所検索中...";
    this.button.disabled = true;
    this.button.classList.add("opacity-50", "cursor-wait");
  }

  /**
   * プライベート：外部APIから住所データを取得
   * @private
   * @param {string} zipcode 7桁の郵便番号
   */
  _fetchAddressFromAPI(zipcode) {
    // ZIP Cloud API（無料・登録不要）を使用
    const apiUrl = `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${zipcode}`;

    fetch(apiUrl)
      .then((response) => {
        // レスポンスのステータスチェック
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        this._handleApiSuccess(data);
      })
      .catch((error) => {
        this._handleApiError(error);
      })
      .finally(() => {
        this._restoreButtonState();
      });
  }

  /**
   * プライベート：API成功時の処理
   * @private
   * @param {Object} data APIレスポンスデータ
   */
  _handleApiSuccess(data) {
    if (data.results && data.results[0]) {
      // 住所データの組み立て
      const result = data.results[0];
      const fullAddress = `${result.address1}${result.address2}${result.address3}`;

      // 住所欄に自動入力
      this.addressTarget.value = fullAddress;

      // 成功通知を表示
      this._showSuccessNotification("住所を自動入力しました");
    } else {
      alert("該当する住所が見つかりませんでした。郵便番号をご確認ください。");
    }
  }

  /**
   * プライベート：API失敗時の処理
   * @private
   * @param {Error} error エラーオブジェクト
   */
  _handleApiError(error) {
    console.error("住所検索API呼び出しエラー:", error);
    alert("住所検索に失敗しました。インターネット接続をご確認ください。");
  }

  /**
   * プライベート：ボタン状態の復元
   * @private
   */
  _restoreButtonState() {
    this.button.innerHTML = "住所検索";
    this.button.disabled = false;
    this.button.classList.remove("opacity-50", "cursor-wait");
  }

  /**
   * プライベート：成功時の控えめな通知表示
   * @private
   * @param {string} message 通知メッセージ
   * @note アラートの代わりに、画面右上に一時的なトースト通知を表示
   */
  _showSuccessNotification(message) {
    // トースト通知要素を作成
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.className = [
      "fixed",
      "top-4",
      "right-4", // 位置：画面右上
      "bg-green-500",
      "text-white", // 色：緑背景・白文字
      "px-4",
      "py-2",
      "rounded",
      "shadow-lg", // スタイル：パディング・角丸・影
      "z-50", // 最前面表示
      "transition-opacity",
      "duration-300", // フェードアニメーション
    ].join(" ");

    // DOMに追加して表示
    document.body.appendChild(notification);

    // 3秒後にフェードアウト開始
    setTimeout(() => {
      notification.classList.add("opacity-0");

      // フェードアウト完了後にDOM削除
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}
