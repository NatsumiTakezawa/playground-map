# syntax=docker/dockerfile:1
# check=error=true

# This Dockerfile is designed for development. Use with Kamal or build'n'run by hand:
# docker build -t app .
# docker run -d -p 3000:3000 -e RAILS_MASTER_KEY=<value from config/master.key> --name app app

# For a containerized dev environment, see Dev Containers: https://guides.rubyonrails.org/getting_started_with_devcontainer.html

# Make sure RUBY_VERSION matches the Ruby version in .ruby-version

ARG RUBY_VERSION=3.3.8
ARG UID=1000
ARG GID=1001
FROM docker.io/library/ruby:$RUBY_VERSION-slim

WORKDIR /app

# Make HOME writable for gem install
ENV HOME=/usr/local/bundle

# Install base packages
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential git libpq-dev nodejs postgresql-client curl libvips sqlite3 libyaml-dev watchman && \
    rm -rf /var/lib/apt/lists/*

ENV BUNDLE_PATH=/usr/local/bundle \
    RAILS_ENV=development \
    TZ=Asia/Tokyo

COPY Gemfile Gemfile.lock ./
RUN gem update --system && bundle install -j$(nproc)

# foreman をグローバルにインストールして、bash の PATH 上に載せる
RUN gem install foreman --no-document

COPY . .

# Install Tailwind CSS specific files (binstub, default config if not present)
RUN bundle exec rails tailwindcss:install

EXPOSE 3000
CMD ["bash", "-c", "bundle exec puma -C config/puma.rb"]
