# README

このリポジトリは、Docker コンテナ上で完結する Rails 8 + Hotwire + Tailwind 学習用サンプルです。

## 開発環境の前提

- すべてのコマンドは **Docker コンテナ内** で実行してください。
- Ruby や PostgreSQL をローカルに直接インストールする必要はありません。

---

## 主な開発用コマンド（すべて Docker 内で実行）

| タスク                   | コマンド例                                                                               |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| 初回セットアップ         | `docker compose build` then `docker compose run --rm web rails db:prepare`               |
| サーバ起動               | `docker compose up`                                                                      |
| サーバ終了               | `Ctrl+C`（フォアグラウンド実行時）または `docker compose down`（バックグラウンド実行時） |
| バックグラウンド起動     | `docker compose up -d`                                                                   |
| マイグレーション実行     | `docker compose run --rm web rails db:migrate`                                           |
| モデル作成               | `docker compose run --rm web rails g model Xxx`                                          |
| コントローラ作成         | `docker compose run --rm web rails g controller Xxx`                                     |
| Gem 追加後のインストール | `docker compose run --rm web bundle install`                                             |
| Tailwind ビルドウォッチ  | `docker compose run --rm web rails tailwindcss:watch`                                    |
| RSpec テスト             | `docker compose run --rm web rspec`                                                      |
| シードデータ投入         | `docker compose run --rm web rails db:seed`                                              |
| Rails コンソール         | `docker compose run --rm web rails c`                                                    |
| DB コンソール            | `docker compose run --rm web rails db`                                                   |
| RuboCop（静的解析）      | `docker compose run --rm web rubocop`                                                    |

---

## よく使うコマンド例

```bash
# 初回セットアップ
$ docker compose build
$ docker compose run --rm web rails db:prepare

# サーバ起動
$ docker compose up

# サーバ起動（バックグラウンド実行）
$ docker compose up -d

# サーバ停止・終了
$ docker compose down

# すべてのコンテナ・ボリュームを削除（完全クリーンアップ）
$ docker compose down -v

# マイグレーション
$ docker compose run --rm web rails db:migrate

# Gem追加後
$ docker compose run --rm web bundle install

# テスト
$ docker compose run --rm web rspec
```

---

## Docker 環境の終了と停止

- **フォアグラウンド実行時の終了**: ターミナルで `Ctrl+C` を押す
- **バックグラウンド実行時の停止**: `docker compose down` を実行
- **完全クリーンアップ**: `docker compose down -v` でコンテナとボリュームを削除
- **特定コンテナの再起動**: `docker compose restart [サービス名]` (例: `docker compose restart web`)

---

## 注意事項

- 必ず `docker compose run --rm web ...` 形式でコマンドを実行してください。
- 直接 `rails` や `bundle` コマンドをホスト OS で実行しないでください。
- .env ファイルや API キーの管理も Docker 内で完結します。

---

## 詳細仕様・セットアップ手順

- 詳細は `rails/docs/rails_specification.md` および `rails/docs/system_design.md` を参照してください。

---

## CLI ツール・コマンド一覧

本プロジェクトで利用できる主な CLI ツールとコマンドの用途・実行例をまとめます。
すべて **Docker コンテナ内** で実行してください。

| ツール/コマンド         | 用途・説明                                                               | 実行例                                                 |
| ----------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------ |
| RSpec (`rspec`)         | モデル・サービス等の自動テストを実行。テスト追加時やリファクタ時に推奨。 | `docker compose run --rm web rspec`                    |
| RuboCop (`rubocop`)     | コードの静的解析・スタイルチェック。コミット前に推奨。                   | `docker compose run --rm web rubocop`                  |
| DB マイグレーション     | スキーマ変更時に実行。                                                   | `docker compose run --rm web rails db:migrate`         |
| シードデータ投入        | サンプルデータ投入。初回セットアップやリセット時に。                     | `docker compose run --rm web rails db:seed`            |
| Rails コンソール        | Rails の REPL。モデル操作やデバッグに便利。                              | `docker compose run --rm web rails c`                  |
| DB コンソール           | psql 等で DB へ直接接続。                                                | `docker compose run --rm web rails db`                 |
| Tailwind ビルドウォッチ | Tailwind CSS の自動ビルド。スタイル編集時に。                            | `docker compose run --rm web rails tailwindcss:watch`  |
| モデル生成              | 新しいモデル作成。                                                       | `docker compose run --rm web rails g model Xxx`        |
| コントローラ生成        | 新しいコントローラ作成。                                                 | `docker compose run --rm web rails g controller Xxx`   |
| Scaffold 生成           | 一括で CRUD 用コントローラ・ビュー等を生成。                             | `docker compose run --rm web rails g scaffold Xxx ...` |
| Gem インストール        | Gemfile 変更後に実行。                                                   | `docker compose run --rm web bundle install`           |

### 補足

- すべてのコマンドは `docker compose run --rm web ...` 形式で実行してください。
- テスト（RSpec）は `spec/` 配下にテストファイルを追加して実行します。
- RuboCop はプロジェクトルートの `.rubocop.yml` 設定に従います。
- DB リセットや再投入が必要な場合は `rails db:reset` も利用可能です。
- コマンドの詳細は `rails --help` で確認できます。

---
