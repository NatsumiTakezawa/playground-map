#!/usr/bin/env bash
set -e

# 起動時に /app および /usr/local/bundle 以下を正しいオーナーに
chown -R "${UID:-1000}:${GID:-1001}" /app
if [ "$(id -u)" = "0" ]; then
  echo "Fixing bundle ownership…"
  chown -R "${UID:-1000}:${GID:-1001}" /usr/local/bundle
fi

# PATHに/app/binを追加
export PATH="/app/bin:$PATH"

exec "$@"
