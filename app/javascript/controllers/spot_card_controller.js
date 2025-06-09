/**
 * 温泉スポットカード用 Stimulusコントローラー
 *
 * 【機能概要】
 * - 温泉スポットカードのホバー効果とクリック効果
 * - 視覚的フィードバック（ハイライト表示）
 * - カードとマップ連携のための基盤機能
 *
 * 【HTMLでの使用例】
 * <div data-controller="spot-card"
 *      data-action="mouseenter->spot-card#highlight mouseleave->spot-card#unhighlight">
 *   <h3>温泉名</h3>
 *   <p>説明...</p>
 * </div>
 *
 * 【学習ポイント】
 * - CSSクラスの動的操作
 * - マウスイベントの処理
 * - Tailwind CSSクラスを使ったUI効果
 * - コンポーネント間連携の基盤作り
 *
 * @see rails/docs/ui_specification_tailwind.md
 */

import { Controller } from "@hotwired/stimulus";

/**
 * @class SpotCardController
 * @classdesc 温泉スポットカードのインタラクティブな効果を制御するコントローラー
 */
export default class extends Controller {
  // 必要に応じてターゲット要素を定義（現在は使用していないが拡張用）
  static targets = ["card"];

  /**
   * コントローラーがDOM要素に接続された時に自動実行
   *
   * 【初期化処理】
   * - カードの初期状態設定
   * - 必要に応じてデータ属性の確認
   * - パフォーマンス向上のための事前計算
   */
  connect() {
    console.log("SpotCardController connected");

    // カードの初期状態を設定
    this._initializeCard();

    // デバッグ用: カードの情報を取得
    this._logCardInfo();
  }

  /**
   * カードをハイライト表示する
   *
   * 【使用例】
   * <div data-action="mouseenter->spot-card#highlight">
   * <div data-action="focus->spot-card#highlight">
   *
   * 【視覚効果】
   * - 青色のリング（ring-2 ring-blue-400）
   * - 影の強調（shadow-lg）
   * - 拡大効果（transform scale-105）- 将来実装
   *
   * 【アクセシビリティ】
   * マウスホバーだけでなく、キーボードフォーカスでも
   * 同じ効果を適用してキーボードユーザーにも配慮
   */
  highlight() {
    console.log("カードをハイライト表示");

    // Tailwind CSSクラスを使ってハイライト効果を適用
    this.element.classList.add(
      "ring-2", // 2px幅のリング
      "ring-blue-400", // 青色のリング
      "shadow-lg" // 大きな影効果
    );

    // 将来の拡張: より滑らかなアニメーション効果
    this._applyHoverAnimation();

    // カードとマップの連携（将来実装）
    this._notifyMapHighlight();
  }

  /**
   * カードのハイライト表示を解除する
   *
   * 【使用例】
   * <div data-action="mouseleave->spot-card#unhighlight">
   * <div data-action="blur->spot-card#unhighlight">
   *
   * 【処理内容】
   * - ハイライト効果のCSSクラスを除去
   * - 元の表示状態に戻す
   * - アニメーション効果の終了
   */
  unhighlight() {
    console.log("カードのハイライトを解除");

    // ハイライト効果のCSSクラスを除去
    this.element.classList.remove("ring-2", "ring-blue-400", "shadow-lg");

    // アニメーション効果の解除
    this._removeHoverAnimation();

    // マップ連携の解除（将来実装）
    this._notifyMapUnhighlight();
  }

  /**
   * カードクリック時の処理（将来実装用）
   *
   * 【使用例】
   * <div data-action="click->spot-card#select">
   *
   * 【想定機能】
   * - 詳細ページへの遷移
   * - モーダルでの詳細表示
   * - マップ上の対応マーカーへのフォーカス
   */
  select() {
    console.log("カードが選択されました");

    // TODO: 将来の実装
    // - 詳細ページへのナビゲーション
    // - マップとの連携（対応するマーカーの強調表示）
    // - 選択状態の視覚的フィードバック
  }

  // === プライベートメソッド（内部処理用） ===

  /**
   * カードの初期状態を設定
   */
  _initializeCard() {
    // ホバー効果のためのトランジション設定
    this.element.classList.add(
      "transition-all", // 全プロパティのトランジション
      "duration-200", // 200ms のアニメーション時間
      "ease-in-out" // なめらかな加速・減速
    );

    // カーソルをポインターに設定（クリック可能であることを示す）
    this.element.style.cursor = "pointer";
  }

  /**
   * デバッグ用: カードの情報をコンソールに出力
   */
  _logCardInfo() {
    // 開発環境でのみデバッグ情報を出力
    if (console && console.log) {
      const cardTitle = this.element.querySelector("h3, .card-title");
      const cardName = cardTitle ? cardTitle.textContent.trim() : "名前不明";
      console.log(`SpotCard initialized: ${cardName}`);
    }
  }

  /**
   * ホバー時のアニメーション効果を適用
   */
  _applyHoverAnimation() {
    // 軽微な拡大効果（将来実装）
    // this.element.classList.add("transform", "scale-105");

    // より目立つ影効果
    this.element.classList.add("shadow-xl");

    // 背景色の微調整（将来実装）
    // this.element.classList.add("bg-blue-50");
  }

  /**
   * ホバー時のアニメーション効果を解除
   */
  _removeHoverAnimation() {
    // 拡大効果の解除（将来実装時）
    // this.element.classList.remove("transform", "scale-105");

    // 影効果を通常レベルに戻す
    this.element.classList.remove("shadow-xl");

    // 背景色を元に戻す（将来実装時）
    // this.element.classList.remove("bg-blue-50");
  }

  /**
   * マップにハイライト状態を通知（将来実装）
   *
   * 【想定機能】
   * - 対応するマップマーカーの強調表示
   * - カスタムイベントの発火
   * - 他のコンポーネントとの連携
   */
  _notifyMapHighlight() {
    // TODO: カスタムイベントを発火してマップコントローラーと連携
    // const event = new CustomEvent('spot-card:highlight', {
    //   detail: { spotId: this.element.dataset.spotId }
    // });
    // document.dispatchEvent(event);
  }

  /**
   * マップにハイライト解除を通知（将来実装）
   */
  _notifyMapUnhighlight() {
    // TODO: カスタムイベントを発火してマップコントローラーと連携
    // const event = new CustomEvent('spot-card:unhighlight', {
    //   detail: { spotId: this.element.dataset.spotId }
    // });
    // document.dispatchEvent(event);
  }
}
