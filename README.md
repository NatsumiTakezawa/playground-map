# README

このリポジトリは、Docker コンテナ上で完結する Rails 8 + Hotwire + Tailwind 学習用サンプルです。

## 開発環境の前提

- すべてのコマンドは **Docker コンテナ内** で実行してください。
- Ruby や PostgreSQL をローカルに直接インストールする必要はありません。

---

## 主な開発用コマンド（すべて Docker 内で実行）

| タスク                   | コマンド例                                                                 |
| ------------------------ | -------------------------------------------------------------------------- |
| 初回セットアップ         | `docker compose build` then `docker compose run --rm web rails db:prepare` |
| サーバ起動               | `docker compose up`                                                        |
| マイグレーション実行     | `docker compose run --rm web rails db:migrate`                             |
| モデル作成               | `docker compose run --rm web rails g model Xxx`                            |
| コントローラ作成         | `docker compose run --rm web rails g controller Xxx`                       |
| Gem 追加後のインストール | `docker compose run --rm web bundle install`                               |
| Tailwind ビルドウォッチ  | `docker compose run --rm web rails tailwindcss:watch`                      |
| RSpec テスト             | `docker compose run --rm web rspec`                                        |
| シードデータ投入         | `docker compose run --rm web rails db:seed`                                |
| Rails コンソール         | `docker compose run --rm web rails c`                                      |
| DB コンソール            | `docker compose run --rm web rails db`                                     |
| RuboCop（静的解析）      | `docker compose run --rm web rubocop`                                      |

---

## よく使うコマンド例

```bash
# 初回セットアップ
$ docker compose build
$ docker compose run --rm web rails db:prepare

# サーバ起動
$ docker compose up

# マイグレーション
$ docker compose run --rm web rails db:migrate

# Gem追加後
$ docker compose run --rm web bundle install

# テスト
$ docker compose run --rm web rspec
```

---

## 注意事項

- 必ず `docker compose run --rm web ...` 形式でコマンドを実行してください。
- 直接 `rails` や `bundle` コマンドをホスト OS で実行しないでください。
- .env ファイルや API キーの管理も Docker 内で完結します。

---

## 詳細仕様・セットアップ手順

- 詳細は `rails/docs/rails_specification.md` および `rails/docs/system_design.md` を参照してください。
