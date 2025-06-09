# 松江市温泉マップ（Rails 教育版）プロダクト仕様書

## 1. 目的

松江市周辺の温泉を検索・閲覧・レビューできる Web アプリを、**React 等を使わず Ruby on Rails 8.0 + Hotwire + Tailwind** で構築する。学習教材としてコードを読みやすく保つことを最優先とする。
開発／CI／本番すべてを Docker コンテナで再現できる学習用リポジトリを提供する。
**認証・権限は一切設けない**。

## 2. 技術スタック

| カテゴリ           | 採用技術 / バージョン                                |
| ------------------ | ---------------------------------------------------- |
| 言語 / FW          | Ruby 3.3.8, Rails 8.0.2                              |
| フロント           | Hotwire (Turbo, Stimulus) + Tailwind CSS + Importmap |
| DB（開発・本番）   | PostgreSQL 15（Docker コンテナ）                     |
| ストレージ         | ローカルストレージ（`public/uploads`）               |
| メッセージ         | Redis 7 + Sidekiq（バックグラウンドジョブ）          |
| アセット           | Propshaft（Rails 8 デフォルト）                      |
| キャッシュ・キュー | Solid Cache, Solid Queue, Solid Cable                |
| インフラ           | Docker, docker-compose                               |
| CI/CD              | 現在は設定なし（ローカル開発優先）                   |

> **ポイント**
>
> - **開発環境はすべて docker-compose up で完結**。
> - 手元に Ruby や Postgres を直接インストールする必要はない。

## 3. サイトマップ

| ID  | 画面名                 | URL                      | アクセス権 |
| --- | ---------------------- | ------------------------ | ---------- |
| S00 | トップ                 | `/`                      | 全員       |
| S01 | 温泉詳細               | `/onsens/:id`            | 全員       |
| S02 | レビュー投稿           | Turbo Stream Modal       | 全員       |
| S03 | **管理ダッシュボード** | `/admin`                 | 全員       |
| S04 | 温泉一覧 (管理)        | `/admin/onsens`          | 全員       |
| S05 | 新規温泉 (管理)        | `/admin/onsens/new`      | 全員       |
| S06 | 温泉編集 (管理)        | `/admin/onsens/:id/edit` | 全員       |
| S07 | CSV インポート         | `/admin/onsens/import`   | 全員       |

> **備考**
>
> - CRUD はすべて `OnsensController` に統合し、匿名で操作可。
> - 認証は無いままですが、UI の整理のため /admin 名前空間を「管理画面」と呼称します。
> - ルートは次のように定義し、フィルタは一切置きません。

      ```ruby

      # config/routes.rb

      Rails.application.routes.draw do
      resources :onsens, only: %i[index show] # 一般閲覧
      namespace :admin do # 誰でも利用可
      root "onsens#index"
      resources :onsens do
      collection { post :import } # POST /admin/onsens/import
      end
      end
      root "onsens#index"
      end

      ```

## 4. ドメインモデル

### 4.1 Onsen

| カラム        | 型                          | 制約・仕様                            |
| ------------- | --------------------------- | ------------------------------------- |
| `name`        | string                      | 必須・100 文字以内                    |
| `geo_lat`     | decimal                     | 必須・小数 6 桁                       |
| `geo_lng`     | decimal                     | 必須・小数 6 桁                       |
| `description` | text                        | 任意・1000 文字以内・プレーンテキスト |
| `tags`        | string                      | 任意・カンマ区切り                    |
| 添付画像      | `has_many_attached :images` | 最大 5 枚・JPEG/PNG/GIF・1 枚 5 MB    |

### 4.2 Review

| カラム     | 型                          | 制約・仕様                     |
| ---------- | --------------------------- | ------------------------------ |
| `rating`   | integer                     | 必須・1〜5                     |
| `comment`  | text                        | 任意・500 文字以内             |
| `onsen_id` | integer                     | 必須・FK                       |
| 添付画像   | `has_many_attached :images` | 最大 3 枚・JPEG/PNG・1 枚 3 MB |

`Onsen` 1-N `Review`（匿名投稿）

### 4.3 CSV インポート

| 項目       | 内容                                                                     |
| ---------- | ------------------------------------------------------------------------ |
| 対応拡張子 | `.csv`（UTF-8、BOM 可）                                                  |
| ヘッダ     | `name`,`geo_lat`,`geo_lng`,`description`,`tags`（順不同可）              |
| 処理       | 行ごとバリデーションし、失敗行はスキップ。最後に「X 行スキップ」と表示。 |

## 5. 検索・フィルタ

1. **テキスト検索**：`name` と `description` の部分一致
2. **位置情報検索**：
   - 「現在地ボタン」で Geolocation API を使用
   - 取得失敗時は住所入力 → ジオコーディング
3. **ハイブリッド検索**：テキスト + 位置情報を組み合わせ可能
4. **半径**：初期 5 km／最大 50 km
5. **タグフィルタ**：複数タグは OR 条件

## 6. 非機能要件

| 分類             | 要件                                                          |
| ---------------- | ------------------------------------------------------------- |
| セキュリティ     | Rails デフォルトの CSRF / XSS 保護を利用                      |
| アクセシビリティ | WCAG 2.1 AA 相当：alt 属性、キーボード操作、ARIA ランドマーク |
| 国際化           | 日本語のみ対応。多言語化は将来課題                            |

## 7. 実行プラットフォーム

| 環境 | 方法                        | 備考                           |
| ---- | --------------------------- | ------------------------------ |
| 開発 | `docker-compose up --build` | web / db / redis / sidekiq     |
| CI   | GitHub Actions `services:`  | docker-compose を再利用        |
| 本番 | Heroku Container Registry   | `heroku container:release web` |

```

```
