# 松江市温泉マップ - 開発環境用Dockerfile
#
# このファイルは開発環境用のDockerイメージを定義します
# 本番環境での使用は推奨されません
#
# ビルド方法:
#   docker compose build
#
# 手動ビルド例:
#   docker build -t matsue-onsen-map .
#   docker run -d -p 3000:3000 --name app matsue-onsen-map

# syntax=docker/dockerfile:1
# check=error=true

# Ruby バージョンを指定（.ruby-versionと合わせる）
ARG RUBY_VERSION=3.3.8
ARG UID=1000
ARG GID=1001

# ベースイメージ: Ruby 3.3.8 on Debian slim
FROM docker.io/library/ruby:$RUBY_VERSION-slim

# アプリケーションディレクトリを設定
WORKDIR /app

# Bundler用のホームディレクトリを設定（権限問題回避）
ENV HOME=/usr/local/bundle

# 必要なシステムパッケージをインストール
# - build-essential: C拡張gem用のコンパイラ
# - git: Gitリポジトリからのgem取得用
# - libpq-dev: PostgreSQL開発ライブラリ
# - nodejs: JavaScript実行環境
# - postgresql-client: DB接続・管理用クライアント
# - curl: HTTP通信用
# - libvips: 画像処理ライブラリ
# - sqlite3: Active Storage用
# - libyaml-dev: YAML処理ライブラリ
# - watchman: ファイル監視（Hotwire用）
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
        build-essential \
        git \
        libpq-dev \
        nodejs \
        postgresql-client \
        curl \
        libvips \
        sqlite3 \
        libyaml-dev \
        watchman && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# 環境変数設定
ENV BUNDLE_PATH=/usr/local/bundle \
    RAILS_ENV=development \
    TZ=Asia/Tokyo

# Gemfile をコピーして依存関係をインストール
COPY Gemfile Gemfile.lock ./
RUN gem update --system && \
    bundle install -j$(nproc) && \
    bundle clean

# Foreman をグローバルインストール（Procfile.dev用）
RUN gem install foreman --no-document

# アプリケーションコードをコピー
COPY . .

# Tailwind CSS の初期設定（Rails 8.0 + Propshaft用）
RUN bundle exec rails tailwindcss:install 2>/dev/null || true

# ユーザー作成（権限問題回避）
RUN groupadd -g $GID app || true && \
    useradd -u $UID -g $GID -m app || true

# 3000番ポートを公開
EXPOSE 3000

# デフォルトコマンド（docker-compose.ymlで上書きされる）
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]

EXPOSE 3000
CMD ["bash", "-c", "bundle exec puma -C config/puma.rb"]
