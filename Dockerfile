# syntax=docker/dockerfile:1
ARG RUBY_VERSION=3.3.8
#########################################
# 1. Base イメージの定義
#########################################
FROM ruby:${RUBY_VERSION}-slim AS base
WORKDIR /app

# 本番時ランタイムパッケージ（PostgreSQL クライアント等）
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      curl libjemalloc2 libvips sqlite3 postgresql-client && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives

ENV RAILS_ENV=development \
    RAILS_LOG_TO_STDOUT=true \
    # BUNDLE_DEPLOYMENT=1 \
    BUNDLE_PATH=/usr/local/bundle

#########################################
# 2. Build ステージ
#########################################
FROM base AS build

# gem ビルドに必要なパッケージのみインストール
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential git libyaml-dev pkg-config libpq-dev nodejs && \
    rm -rf /var/lib/apt/lists/* /var/cache/apt/archives

# 2-1) Gems のインストール
COPY Gemfile ./
# COPY Gemfile Gemfile.lock ./
# RUN bundle install --jobs 4 --retry 3
RUN bundle install

# 2-2) アプリケーションコードをコピー
COPY . .

# 2-3) bootsnap プリコンパイル（起動高速化）
RUN bundle exec bootsnap precompile --gemfile

# 2-4) Tailwind 入力ファイルを明示的に指定
# tailwindcss-rails gem は環境変数 TAILWINDCSS_INPUT を参照します
# Rails の初期化ファイルでも設定することを推奨
ENV TAILWINDCSS_INPUT=app/assets/stylesheets/application.tailwind.css

# 2-5) アセットプリコンパイル
# SECRET_KEY_BASE が不要な形でプリコンパイルします
RUN SECRET_KEY_BASE_DUMMY=1 bundle exec rails assets:precompile

#########################################
# 3. 実行用イメージ
#########################################
FROM base

# 非 root ユーザー作成
RUN groupadd --system --gid 1000 rails && \
    useradd --system --uid 1000 --gid rails --create-home --shell /bin/bash rails

# build ステージからバンドル済み gems とアプリコードをコピー
COPY --from=build /usr/local/bundle /usr/local/bundle
COPY --from=build /app /app

# パーミッション調整
RUN chown -R rails:rails /app /usr/local/bundle

USER rails
WORKDIR /app

# データベース準備用エントリポイント
ENTRYPOINT ["bin/docker-entrypoint"]

# ポート公開
EXPOSE 3000

# デフォルトコマンド
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
