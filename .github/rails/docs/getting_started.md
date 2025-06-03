# Getting Started - 松江市温泉マップ

## 0. 必要ツール

- **Docker Desktop** ≥ 4.x（macOS / Windows）
- または `docker` + `docker-compose` CLI（Linux）

## 1. プロジェクトの取得

```bash
# プロジェクトのディレクトリに移動
cd matsue-onsen-map-temp
cp .env.sample .env      # 環境変数ファイルを作成
```

## 2. 環境設定

`.env` ファイルを編集し、必要な API キーを設定してください：

```bash
# ==== Rails ====
RAILS_ENV=development
RAILS_MASTER_KEY=your_master_key_here  # config/master.key の内容

# ==== Database ====
DATABASE_URL=postgres://postgres:password@db:5432/postgres

# ==== Redis / Sidekiq ====
REDIS_URL=redis://redis:6379/0

# ==== External APIs ====
GOOGLE_MAPS_API_KEY=your_google_maps_api_key  # Googleマップ用
AWS_ACCESS_KEY_ID=your_aws_access_key         # S3用（本番のみ）
AWS_SECRET_ACCESS_KEY=your_aws_secret_key     # S3用（本番のみ）
S3_BUCKET_NAME=your_s3_bucket_name           # S3用（本番のみ）

# ==== Docker ====
UID=1000
GID=1000
```

## 3. 初回セットアップ

```bash
# Dockerイメージをビルド
docker compose build

# データベースの作成とマイグレーション
docker compose run --rm web rails db:create
docker compose run --rm web rails db:migrate

# シードデータの投入（オプション）
docker compose run --rm web rails db:seed

# アセットのプリコンパイル
docker compose run --rm web rails assets:precompile
```

## 4. アプリケーション起動

```bash
# 全サービスを起動
docker compose up

# バックグラウンドで起動する場合
docker compose up -d
```

起動後、以下の URL でアクセスできます：

- **メインアプリ**: http://localhost:3000
- **管理画面**: http://localhost:3000/admin

## 5. 開発中の主なコマンド

コンテナ内で Rails コマンドを実行する際は、以下の形式を使用します：

```bash
# 基本形式
docker compose run --rm web [コマンド]

# マイグレーション実行
docker compose run --rm web rails db:migrate

# ルーティング確認
docker compose run --rm web rails routes

# コンソール起動
docker compose run --rm web rails console

# テスト実行
docker compose run --rm web rspec

# Tailwind CSS の監視モード（開発時）
docker compose run --rm web rails tailwindcss:watch

# アセットプリコンパイル
docker compose run --rm web rails assets:precompile

# 新しいモデル作成例
docker compose run --rm web rails g model Example name:string

# 新しいコントローラ作成例
docker compose run --rm web rails g controller Examples index show
```

## 6. データベース操作

```bash
# データベース作成
docker compose run --rm web rails db:create

# マイグレーション実行
docker compose run --rm web rails db:migrate

# データベースリセット（開発時）
docker compose run --rm web rails db:reset

# シードデータ投入
docker compose run --rm web rails db:seed

# マイグレーション状態確認
docker compose run --rm web rails db:migrate:status
```

## 7. トラブルシューティング

### JavaScript/Stimulus コントローラが動作しない場合

```bash
# アセットプリコンパイルを実行
docker compose run --rm web rails assets:precompile

# サーバーを再起動
docker compose restart web
```

### データベース接続エラーの場合

```bash
# データベースコンテナの状態確認
docker compose ps

# データベースコンテナの再起動
docker compose restart db

# データベース接続確認
docker compose run --rm web rails db:version
```

### ポート衝突エラーの場合

```bash
# 使用中のポートを確認
lsof -i :3000

# 既存のコンテナを停止
docker compose down

# 再起動
docker compose up
```

## 8. 本番デプロイ（Heroku Container）

**注意**: 現在のプロジェクトはローカル開発用に設定されており、本番デプロイには追加の設定が必要です。

```bash
# Heroku CLI でログイン
heroku login
heroku container:login

# アプリケーション作成
heroku create matsue-onsen

# 環境変数設定
heroku config:set RAILS_MASTER_KEY=$(cat config/master.key) --app matsue-onsen

# アドオン追加
heroku addons:create heroku-postgresql:hobby-dev --app matsue-onsen
heroku addons:create heroku-redis:hobby-dev --app matsue-onsen

# コンテナビルド・デプロイ
heroku container:push web --app matsue-onsen
heroku container:release web --app matsue-onsen

# データベースマイグレーション
heroku run rails db:migrate --app matsue-onsen
```

## 9. プロジェクト構成の確認

現在のプロジェクトには以下が含まれています：

### モデル

- `Onsen`: 温泉情報（名前、緯度経度、説明、タグ）
- `Review`: レビュー情報（評価、コメント）
- Active Storage による画像アップロード機能

### コントローラ

- `OnsensController`: 公開側の温泉一覧・詳細表示
- `ReviewsController`: レビュー投稿機能
- `Admin::OnsensController`: 管理画面での温泉 CRUD 操作

### 主要機能

- 温泉の検索・フィルタ機能
- 郵便番号による住所自動入力
- Google Maps 連携（API キー設定時）
- レスポンシブデザイン（Tailwind CSS）
- Hotwire/Turbo による SPA ライクな操作感

---

## まとめ：クイックスタート

1. **Docker Desktop を起動**
2. **.env ファイルを設定**
   ```bash
   cp .env.sample .env
   # 必要なAPIキーを編集
   ```
3. **開発環境の起動**
   ```bash
   docker compose build
   docker compose run --rm web rails db:create db:migrate db:seed
   docker compose up
   ```
4. **ブラウザでアクセス**

   - <http://localhost:3000> （メインアプリ）
   - <http://localhost:3000/admin> （管理画面）

5. **開発作業時のコマンド**

   ```bash
   # 新機能追加時
   docker compose run --rm web [railsコマンド]

   # アセット更新後
   docker compose run --rm web rails assets:precompile
   docker compose restart web
   ```
