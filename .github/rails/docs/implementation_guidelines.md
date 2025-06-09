# 実装ガイドライン

## 0. 前提

- すべてのコマンドは **コンテナ内** で実行する。
  例）`docker compose run --rm web bundle exec rails g model ...`

## 1. コーディング規約

- **RuboCop Rails** の既定 + プロジェクト用 `.rubocop.yml`
- サービス層を活用し「Fat Model / Skinny Controller」を回避。
- JS は Importmap 固定。Webpack 等を追加しない。

## 2. Tailwind 設定

プロジェクト生成時は Docker 経由で実行する例：

```bash
docker compose run --rm web rails new . --force --css=tailwind --skip-javascript
```

- カスタム色は config/tailwind.config.js の extend.colors へ。

- 共通スタイルは @layer components で抽象化。

## 3. 禁止事項

1.  React / Vue / Svelte 等の SPA フレームワーク

2.  Webpacker / jsbundling-rails の導入

    - なお，使用することが Rails で一般的なものであれば gem を追加してもよい.
    - npm などは使用しない

3.  認証・認可ロジックの追加

4.  コントローラ 100 行超過

## 4. 推奨プラクティス

- Google Maps API Key は credentials.yml.enc へ保存し環境変数で復号。

- 画像ファイルは `public/uploads` ディレクトリへ保存（Active Storage は現在未使用）。

- シードデータは db/seeds.rb に Onsen 10 件・Review 合計 30 件を用意。

- 環境変数は .env ↔ docker-compose.yml で一元管理。

- Google Maps API Key は RAILS_MASTER_KEY と併せて .env には置かない（.env.sample に鍵名のみ記載）。

## 5. 郵便番号・住所機能について

- 郵便番号 → 住所自動入力：zipcloud.ibsnet.co.jp の無料 API 使用（設定不要）

- 住所 → 緯度経度変換：Google Geocoding API 使用（API Key 必要）

- 温泉検索：MapService クラスで距離計算実装

## 5. エラーメッセージ指針

- 入力エラー: 「%{field}」を正しく入力してください。

- システムエラー（500）: システムエラーが発生しました。時間をおいて再度お試しください。

## 6. ストレージについて

- 現在のところ、Active Storage は使用しない。
- 画像やファイルの保存は、`public/uploads` ディレクトリを使用。

## 7. CI/CD について

- 現在はローカルでの開発を学習用としているため、CI/CD の設定は行わない。

## 8. コマンド実行の注意点

- **重要**: すべての Rails コマンドは `bundle exec` を付けて実行する
- Docker コンテナ内での実行形式：`docker compose run --rm web bundle exec rails [コマンド]`
- アセットプリコンパイルは JavaScript 機能変更時に必須実行

---
