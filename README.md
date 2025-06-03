# 松江市温泉マップ（Rails 教育版）

松江市周辺の温泉を検索・閲覧・レビューできる Web アプリケーション。Docker 環境で完結する Rails 8 + Hotwire + Tailwind 学習用サンプルです。

## 技術スタック

- **フレームワーク**: Ruby on Rails 8.x
- **フロントエンド**: Hotwire (Turbo + Stimulus) + Tailwind CSS
- **データベース**: PostgreSQL 15
- **コンテナ**: Docker + docker-compose
- **JavaScript**: Importmap（Webpack 等は使用しない）

## 主な機能

- 温泉スポットの一覧表示・詳細表示
- 地図上での温泉位置表示（Google Maps API）
- 温泉の検索・フィルタリング
- 郵便番号からの住所自動入力機能
- 住所から緯度経度の自動取得
- レビュー投稿機能
- 管理画面（CRUD 操作・CSV インポート）

---

## セットアップ手順

### 1. 必要ツール

- Docker Desktop ≥ 4.x または docker + docker-compose CLI

### 2. 初回セットアップ

```bash
# リポジトリをクローン
git clone <repository-url>
cd matsue-onsen-map-temp

# 環境変数ファイルの作成（必要に応じて編集）
cp .env.sample .env

# Dockerイメージのビルド
docker compose build

# データベースの準備
docker compose run --rm web rails db:prepare

# アセットのプリコンパイル（JavaScript機能のため重要）
docker compose run --rm web rails assets:precompile

# サーバー起動
docker compose up
```

### 3. アクセス確認

ブラウザで `http://localhost:3000` にアクセスしてください。

---

## 開発用コマンド一覧

すべてのコマンドは **Docker コンテナ内** で実行してください。

### 基本操作

| タスク               | コマンド                              |
| -------------------- | ------------------------------------- |
| サーバ起動           | `docker compose up`                   |
| バックグラウンド起動 | `docker compose up -d`                |
| サーバ停止           | `Ctrl+C` または `docker compose down` |
| サーバ再起動         | `docker compose restart web`          |
| 完全クリーンアップ   | `docker compose down -v`              |

### 開発・メンテナンス

| タスク                   | コマンド                                              |
| ------------------------ | ----------------------------------------------------- |
| マイグレーション実行     | `docker compose run --rm web rails db:migrate`        |
| シードデータ投入         | `docker compose run --rm web rails db:seed`           |
| アセットプリコンパイル   | `docker compose run --rm web rails assets:precompile` |
| Gem 追加後のインストール | `docker compose run --rm web bundle install`          |
| テスト実行               | `docker compose run --rm web rspec`                   |
| 静的解析（RuboCop）      | `docker compose run --rm web rubocop`                 |

### 生成系コマンド

| タスク           | コマンド                                             |
| ---------------- | ---------------------------------------------------- |
| モデル作成       | `docker compose run --rm web rails g model Xxx`      |
| コントローラ作成 | `docker compose run --rm web rails g controller Xxx` |
| Scaffold 生成    | `docker compose run --rm web rails g scaffold Xxx`   |

### デバッグ・確認

| タスク           | コマンド                               |
| ---------------- | -------------------------------------- |
| Rails コンソール | `docker compose run --rm web rails c`  |
| DB コンソール    | `docker compose run --rm web rails db` |
| ログ確認         | `docker compose logs web`              |

---

## ⚠️ トラブルシューティング

### JavaScript 機能（Stimulus コントローラー）が動作しない場合

新しい Stimulus コントローラーを追加したり、既存のコントローラーが動作しない場合の対処法：

1. **アセットプリコンパイルの実行**

   ```bash
   docker compose run --rm web rails assets:precompile
   ```

2. **サーバーの再起動**

   ```bash
   docker compose restart web
   ```

3. **ブラウザキャッシュのクリア**
   - デベロッパーツールで Network タブの「Disable cache」をチェック
   - または強制リロード（Ctrl+Shift+R / Cmd+Shift+R）

### よくある症状と対処法

- **ボタンを押しても反応しない** → 上記手順 1-2 を実行
- **console.log が表示されない** → Importmap に含まれていない可能性があります
- **JavaScript エラーが発生** → ブラウザのコンソールでエラー内容を確認

---

## 外部 API 設定（オプション）

### Google Maps API（地図表示・ジオコーディング用）

1. Google Cloud Platform でプロジェクトを作成
2. Maps JavaScript API と Geocoding API を有効化
3. API キーを取得
4. `.env`ファイルに設定:
   ```env
   GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### 郵便番号検索 API

- zipcloud.ibsnet.co.jp の無料 API を使用（設定不要）
- インターネット接続があれば自動で動作

---

## 開発時の注意点

### 重要な原則

- **すべての Rails コマンドは `docker compose run --rm web` 経由で実行**
- **ホスト OS に直接 Ruby 環境をインストールする必要はありません**
- **ファイル変更はホスト側で行い、コマンド実行はコンテナ内で行います**

### アセット管理について

- 新しい JavaScript（Stimulus コントローラー）を追加した場合は、必ずアセットプリコンパイルを実行
- `app/javascript/controllers/index.js`に新しいコントローラーが正しく登録されているか確認
- JavaScript 機能が動作しない場合は、ブラウザのデベロッパーツールでコンソールエラーを確認

---

## 詳細仕様

詳細な仕様については以下のドキュメントを参照してください：

- `rails/docs/rails_specification.md`
- `rails/docs/system_design.md`
