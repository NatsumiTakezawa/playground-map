# Getting Started

## 0. 必要ツール

- **Docker Desktop** ≥ 4.x（macOS / Windows）
- または `docker` + `docker-compose` CLI（Linux）

## 1. リポジトリをクローン

```bash
git clone https://github.com/your-name/matsue_onsen.git
cd matsue_onsen
cp .env.sample .env      # APIキーなどを記入
```

## 2. 初回セットアップ

```
docker compose build     # Gem と npm パッケージをインストール
docker compose run --rm web rails db:prepare
docker compose run --rm web rails active_storage:install
docker compose run --rm web rails tailwindcss:build
# 管理画面用コントローラ・ビュー一括生成
docker compose run --rm web rails g scaffold_controller admin/onsen \
  name:string geo_lat:decimal geo_lng:decimal description:text tags:string
```

## 3. アプリ起動

```
docker compose up        # web:3000, db:5432, redis:6379
open http://localhost:3000
```

## 4. コンテナ内での主なコマンド

| タスク                  | コマンド例                                            |
| ----------------------- | ----------------------------------------------------- |
| 新しいモデル作成        | `docker compose run --rm web rails g model Xxx`       |
| マイグレーション実行    | `docker compose run --rm web rails db:migrate`        |
| RSpec 実行              | `docker compose run --rm web rspec`                   |
| Tailwind ビルドウォッチ | `docker compose run --rm web rails tailwindcss:watch` |

## 5. 本番デプロイ（Heroku Container）

```
heroku login
heroku container:login
heroku create matsue-onsen
heroku config:set RAILS_MASTER_KEY=$(cat config/master.key)
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev
heroku container:push web --app matsue-onsen
heroku container:release web --app matsue-onsen
heroku run rails db:migrate --app matsue-onsen
```

---

## 5. `Dockerfile`（ルート直下に新規作成）

```dockerfile
FROM ruby:3.3-slim

# 基本ライブラリ
RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      build-essential libpq-dev nodejs postgresql-client curl && \
    rm -rf /var/lib/apt/lists/*

# 作業ディレクトリ
WORKDIR /app
ENV BUNDLE_PATH=/gems \
    RAILS_ENV=development \
    TZ=Asia/Tokyo

# Gemfile だけ先にコピーして bundle install（キャッシュ効率化）
COPY Gemfile Gemfile.lock ./
RUN gem update --system && bundle install -j$(nproc)

# アプリケーション全体をコピー
COPY . .

# ポート
EXPOSE 3000
CMD ["bash", "-c", "bundle exec puma -C config/puma.rb"]
```

---

## 6. `docker-compose.yml`（ルート直下に新規作成）

```yaml
version: "3.9"

services:
  web:
    build: .
    command: bundle exec puma -C config/puma.rb
    volumes:
      - .:/app
      - bundle_cache:/gems
    ports:
      - "3000:3000"
    env_file: .env
    depends_on:
      - db
      - redis

  sidekiq:
    build: .
    command: bundle exec sidekiq
    volumes:
      - .:/app
      - bundle_cache:/gems
    env_file: .env
    depends_on:
      - db
      - redis

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
  bundle_cache:
```

---

## 7. .env.sample

```
# ==== Rails ====
RAILS_ENV=development
RAILS_MASTER_KEY=replace_with_your_master_key

# ==== Database ====
DATABASE_URL=postgres://postgres:password@db:5432/postgres

# ==== Redis / Sidekiq ====
REDIS_URL=redis://redis:6379/0

# ==== External APIs ====
GOOGLE_MAPS_API_KEY=replace_me
AWS_ACCESS_KEY_ID=replace_me
AWS_SECRET_ACCESS_KEY=replace_me
S3_BUCKET_NAME=replace_me
```

---

## まとめ：簡単な使い方

1. **Docker Desktop を起動**
2. **.env ファイルを準備**
   - 必要な API キーなどを設定
3. **開発環境の起動**
   ```bash
   docker compose build
   docker compose up
   ```
4. **Rails コマンド実行**
   ```bash
   docker compose run --rm web [コマンド]
   ```
5. **CI/CD パイプライン**
   - GitHub Actions でも同じ docker-compose 構成でテスト
   - 本番環境は Heroku Container Registry へ同じイメージをデプロイ
