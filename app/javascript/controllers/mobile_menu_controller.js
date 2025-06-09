// モバイルナビゲーションメニュー制御
//
// == 概要
// ハンバーガーメニューのトグル機能を提供するStimulusコントローラです。
// レスポンシブデザインにおいて、モバイル端末でのナビゲーション体験を向上させます。
//
// == 主要機能
// 1. ハンバーガーアイコン ⇔ クローズアイコンの切り替え
// 2. メニューパネルの表示・非表示制御
// 3. アクセシビリティ対応（ARIA属性の動的更新）
// 4. キーボードナビゲーション対応（Escキーでクローズ）
//
// == 使用方法
// ナビバーの要素に data-controller="mobile-menu" を付与し、
// 以下のターゲットとアクションを設定:
// - data-mobile-menu-target="button" (トグルボタン)
// - data-mobile-menu-target="menu" (メニューパネル)
// - data-action="click->mobile-menu#toggle" (トグル操作)
//
// == アクセシビリティ配慮
// - ARIA属性の適切な更新
// - キーボード操作対応
// - スクリーンリーダー対応
//
// @see app/views/layouts/_navbar.html.erb ナビバーでの使用例
// @since 1.0.0
// @author 松江市温泉マップ開発チーム

import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  // == Stimulus Target 定義 ==
  // DOM要素への参照を自動設定
  static targets = ["button", "menu"];

  // == 初期化処理 ==
  // コントローラがDOMにアタッチされた際に実行
  connect() {
    // キーボードイベントの設定
    this.boundHandleKeydown = this.handleKeydown.bind(this);
    document.addEventListener("keydown", this.boundHandleKeydown);

    // 初期状態の確保（メニューは閉じた状態）
    this.ensureClosedState();

    // デバッグログ（開発時のみ）
    console.log("[mobile-menu] コントローラが接続されました");
  }

  // == 終了処理 ==
  // コントローラがDOMから切り離された際に実行
  disconnect() {
    // イベントリスナーの適切な削除（メモリリーク防止）
    if (this.boundHandleKeydown) {
      document.removeEventListener("keydown", this.boundHandleKeydown);
    }

    console.log("[mobile-menu] コントローラが切断されました");
  }

  // == メニューのトグル操作 ==
  // ハンバーガーメニューボタンクリック時のメイン処理
  //
  // @param {Event} event - クリックイベント
  toggle(event) {
    // イベントのバブリングを防止
    event.preventDefault();
    event.stopPropagation();

    // 現在の表示状態を判定
    const isOpen = this.isMenuOpen();

    // トグル実行
    if (isOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }

    // デバッグログ
    console.log(
      `[mobile-menu] メニューをトグル: ${isOpen ? "クローズ" : "オープン"}`
    );
  }

  // == メニューを開く ==
  // メニューパネルの表示とアクセシビリティ属性の更新
  openMenu() {
    // メニューパネルの表示
    this.menuTarget.classList.remove("hidden");

    // ボタンのARIA属性更新（スクリーンリーダー対応）
    this.buttonTarget.setAttribute("aria-expanded", "true");
    this.buttonTarget.setAttribute("aria-label", "メニューを閉じる");

    // アイコンの切り替え（ハンバーガー→クローズ）
    this.switchToCloseIcon();

    // フォーカスをメニュー内の最初のリンクに移動（キーボードナビゲーション対応）
    this.focusFirstMenuItem();
  }

  // == メニューを閉じる ==
  // メニューパネルの非表示とアクセシビリティ属性の復元
  closeMenu() {
    // メニューパネルの非表示
    this.menuTarget.classList.add("hidden");

    // ボタンのARIA属性復元
    this.buttonTarget.setAttribute("aria-expanded", "false");
    this.buttonTarget.setAttribute("aria-label", "メニューを開く");

    // アイコンの切り替え（クローズ→ハンバーガー）
    this.switchToHamburgerIcon();
  }

  // == キーボードイベントハンドラ ==
  // Escキーでメニュークローズなどの操作
  //
  // @param {KeyboardEvent} event - キーボードイベント
  handleKeydown(event) {
    // Escキーが押された場合にメニューを閉じる
    if (event.key === "Escape" && this.isMenuOpen()) {
      this.closeMenu();

      // フォーカスをハンバーガーボタンに戻す
      this.buttonTarget.focus();

      console.log("[mobile-menu] Escキーでメニューをクローズしました");
    }
  }

  // == プライベートヘルパーメソッド ==

  // メニューの開閉状態を判定
  // @return {boolean} メニューが開いている場合true
  isMenuOpen() {
    return !this.menuTarget.classList.contains("hidden");
  }

  // ハンバーガーアイコンに切り替え
  switchToHamburgerIcon() {
    const hamburgerIcon = this.buttonTarget.querySelector("svg:first-child");
    const closeIcon = this.buttonTarget.querySelector("svg:last-child");

    if (hamburgerIcon && closeIcon) {
      hamburgerIcon.classList.remove("hidden");
      hamburgerIcon.classList.add("block");
      closeIcon.classList.remove("block");
      closeIcon.classList.add("hidden");
    }
  }

  // クローズアイコンに切り替え
  switchToCloseIcon() {
    const hamburgerIcon = this.buttonTarget.querySelector("svg:first-child");
    const closeIcon = this.buttonTarget.querySelector("svg:last-child");

    if (hamburgerIcon && closeIcon) {
      hamburgerIcon.classList.remove("block");
      hamburgerIcon.classList.add("hidden");
      closeIcon.classList.remove("hidden");
      closeIcon.classList.add("block");
    }
  }

  // 初期状態の確保（開発時の状態リセット）
  ensureClosedState() {
    this.menuTarget.classList.add("hidden");
    this.buttonTarget.setAttribute("aria-expanded", "false");
    this.buttonTarget.setAttribute("aria-label", "メニューを開く");
    this.switchToHamburgerIcon();
  }

  // メニュー内の最初のリンクにフォーカス移動
  // キーボードナビゲーションのユーザビリティ向上
  focusFirstMenuItem() {
    const firstLink = this.menuTarget.querySelector("a");
    if (firstLink) {
      firstLink.focus();
    }
  }
}
