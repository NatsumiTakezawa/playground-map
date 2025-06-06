/**
 * ファイル入力フィールド制御 Stimulusコントローラー
 *
 * 【機能概要】
 * - ファイル選択時の視覚的フィードバック
 * - 選択されたファイル名の表示
 * - 複数ファイル選択時の一覧表示
 * - ファイルサイズ・形式の検証（将来実装）
 *
 * 【HTMLでの使用例】
 * <div data-controller="file-input">
 *   <input type="file"
 *          data-file-input-target="input"
 *          data-action="change->file-input#updateLabel"
 *          multiple>
 *   <span data-file-input-target="label">選択されていません</span>
 * </div>
 *
 * 【学習ポイント】
 * - ファイルAPIの基本的な使用方法
 * - 配列操作（Array.from, map, join）
 * - ユーザーフィードバックの重要性
 * - DOM要素の条件付き操作
 */

import { Controller } from "@hotwired/stimulus";

/**
 * @class FileInputController
 * @classdesc ファイル入力フィールドのユーザビリティ向上を担当するコントローラー
 */
export default class extends Controller {
  // Stimulusが管理するターゲット要素を定義
  static targets = ["input", "label"];

  /**
   * コントローラーがDOM要素に接続された時に自動実行
   *
   * 【初期化処理】
   * - ラベルの初期状態を設定
   * - 既存のファイル選択状態を確認（ページリロード時など）
   */
  connect() {
    console.log("FileInputController connected");

    // 初期化時にラベルの状態を更新
    this._updateLabel();

    // アクセシビリティ属性を設定
    this._setupAccessibilityAttributes();
  }

  /**
   * ファイル選択時に呼ばれるメインメソッド
   *
   * 【使用例】
   * <input data-action="change->file-input#updateLabel">
   *
   * 【処理の流れ】
   * 1. 選択されたファイルの情報を取得
   * 2. ファイルの妥当性をチェック
   * 3. ラベル表示を更新
   * 4. 必要に応じて追加の視覚的フィードバック
   */
  updateLabel() {
    try {
      // ターゲット要素の存在確認
      if (!this._hasRequiredTargets()) {
        console.warn("必要なターゲット要素が見つかりません");
        return;
      }

      // ファイル情報を取得して表示を更新
      const fileInfo = this._getFileInformation();
      this._updateDisplayLabel(fileInfo);

      // 追加の視覚的フィードバック
      this._updateVisualFeedback(fileInfo);
    } catch (error) {
      console.error("ファイルラベル更新でエラー:", error);
      this._showErrorMessage("ファイル情報の取得に失敗しました");
    }
  }

  // === プライベートメソッド（内部処理用） ===

  /**
   * 必要なターゲット要素が存在するかチェック
   * @returns {boolean} 必要な要素が全て存在する場合true
   */
  _hasRequiredTargets() {
    return this.hasInputTarget && this.hasLabelTarget;
  }

  /**
   * 選択されたファイルの情報を取得・整理
   * @returns {Object} ファイル情報オブジェクト
   */
  _getFileInformation() {
    const files = this.inputTarget.files;
    const fileCount = files ? files.length : 0;

    if (fileCount === 0) {
      return {
        hasFiles: false,
        count: 0,
        names: [],
        totalSize: 0,
        displayText: "選択されていません",
      };
    }

    // ファイル情報を配列に変換
    const fileArray = Array.from(files);
    const fileNames = fileArray.map((file) => file.name);
    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);

    return {
      hasFiles: true,
      count: fileCount,
      names: fileNames,
      totalSize: totalSize,
      displayText: this._createDisplayText(fileNames, fileCount),
    };
  }

  /**
   * ファイル名から表示用テキストを作成
   * @param {Array} fileNames - ファイル名の配列
   * @param {number} fileCount - ファイル数
   * @returns {string} 表示用テキスト
   */
  _createDisplayText(fileNames, fileCount) {
    if (fileCount === 1) {
      // 1ファイルの場合：ファイル名をそのまま表示
      return fileNames[0];
    } else if (fileCount <= 3) {
      // 3ファイル以下の場合：すべてのファイル名を表示
      return fileNames.join(", ");
    } else {
      // 4ファイル以上の場合：最初の2ファイル + "他X個"
      return `${fileNames.slice(0, 2).join(", ")} 他${fileCount - 2}個`;
    }
  }

  /**
   * ラベルの表示を更新
   * @param {Object} fileInfo - ファイル情報オブジェクト
   */
  _updateDisplayLabel(fileInfo) {
    // ラベルのテキストを更新
    this.labelTarget.textContent = fileInfo.displayText;

    // ファイル数に応じてCSSクラスを調整
    this._updateLabelStyling(fileInfo);
  }

  /**
   * ファイル選択状態に応じてラベルのスタイリングを更新
   * @param {Object} fileInfo - ファイル情報オブジェクト
   */
  _updateLabelStyling(fileInfo) {
    // 既存のステータスクラスをリセット
    this.labelTarget.classList.remove(
      "text-gray-500", // 未選択時
      "text-green-600", // 選択済み
      "text-red-600" // エラー時
    );

    if (fileInfo.hasFiles) {
      // ファイル選択済み：緑色で表示
      this.labelTarget.classList.add("text-green-600");

      // ファイル数に応じた追加情報を設定
      this._setFileCountAttribute(fileInfo.count);
    } else {
      // 未選択：グレーで表示
      this.labelTarget.classList.add("text-gray-500");
    }
  }

  /**
   * 視覚的フィードバックを更新
   * @param {Object} fileInfo - ファイル情報オブジェクト
   */
  _updateVisualFeedback(fileInfo) {
    // ファイル選択後のアニメーション効果（将来実装）
    if (fileInfo.hasFiles) {
      this._showSuccessAnimation();
    }

    // ファイルサイズ警告（将来実装）
    this._checkFileSizeWarning(fileInfo.totalSize);
  }

  /**
   * ファイル数をdata属性に設定（CSS等での参照用）
   * @param {number} count - ファイル数
   */
  _setFileCountAttribute(count) {
    this.element.setAttribute("data-file-count", count);
  }

  /**
   * アクセシビリティ属性を設定
   */
  _setupAccessibilityAttributes() {
    // ファイル入力とラベルの関連付け
    if (this.hasLabelTarget && this.hasInputTarget) {
      const inputId = this.inputTarget.id || this._generateInputId();
      this.inputTarget.id = inputId;
      this.labelTarget.setAttribute("for", inputId);
    }
  }

  /**
   * 入力フィールド用のIDを生成
   * @returns {string} 一意のID
   */
  _generateInputId() {
    return `file-input-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 成功時のアニメーション効果（将来実装）
   */
  _showSuccessAnimation() {
    // TODO: 軽微なアニメーション効果を追加
    // 例：フェードイン、スライドイン、色の変化など
    // 一時的なクラス追加によるアニメーション
    // this.labelTarget.classList.add('animate-pulse');
    // setTimeout(() => {
    //   this.labelTarget.classList.remove('animate-pulse');
    // }, 1000);
  }

  /**
   * ファイルサイズ警告チェック（将来実装）
   * @param {number} totalSize - 総ファイルサイズ（バイト）
   */
  _checkFileSizeWarning(totalSize) {
    // TODO: ファイルサイズ制限のチェック
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (totalSize > maxSize) {
      console.warn("ファイルサイズが大きすぎます:", totalSize);
      // this._showSizeWarning(totalSize, maxSize);
    }
  }

  /**
   * エラーメッセージを表示
   * @param {string} message - エラーメッセージ
   */
  _showErrorMessage(message) {
    if (this.hasLabelTarget) {
      this.labelTarget.textContent = message;
      this.labelTarget.classList.add("text-red-600");
    }
  }

  /**
   * ラベルの内部処理（connect時とupdateLabel時の共通処理）
   */
  _updateLabel() {
    // 内部的にupdateLabelを呼び出し
    this.updateLabel();
  }
}
