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
