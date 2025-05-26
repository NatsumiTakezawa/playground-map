#!/usr/bin/env bash
set -e

# 起動時に /app 以下を正しいオーナーに
chown -R "${UID:-1000}:${GID:-1001}" /app

# PATHに/app/binを追加
export PATH="/app/bin:$PATH"

exec "$@"
