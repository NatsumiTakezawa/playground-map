# 松江市温泉マップ（Rails 教育版）

松江市周辺の温泉を検索・閲覧・レビューできる Web アプリケーション。Docker 環境で完結する Rails 8 + Hotwire + Tailwind 学習用サンプルです。

## 技術スタック

- **言語・フレームワーク**: Ruby 3.3.8 + Rails 8.0.2
- **フロントエンド**: Hotwire (Turbo + Stimulus) + Tailwind CSS + Importmap
- **データベース**: PostgreSQL 15（開発環境・本番環境共通）
- **ジョブ処理**: Sidekiq + Redis 7
- **コンテナ**: Docker + docker-compose
- **アセットパイプライン**: Propshaft（Rails 8 デフォルト）
- **キャッシュ・キュー**: Solid Cache, Solid Queue, Solid Cable

## 主な機能

### 一般ユーザー向け機能

- 温泉スポットの一覧表示・詳細表示
- 地図上での温泉位置表示（Google Maps API）
- 温泉の検索・フィルタリング（テキスト検索・位置情報検索）
- レビュー投稿機能（評価・コメント・画像アップロード）

### 住所・位置情報機能

- 郵便番号からの住所自動入力機能（zipcloud API）
- 住所から緯度経度の自動取得（Google Geocoding API）
- 現在地取得（Geolocation API）
- 半径指定での温泉検索

### 管理機能

- 管理画面（認証なしでアクセス可能）
- 温泉情報の CRUD 操作
- CSV ファイルからの一括インポート
- 画像アップロード機能

### 技術的特徴

- Hotwire/Turbo による SPA ライクな操作感
- Stimulus による JavaScript 機能
- レスポンシブデザイン（Tailwind CSS）
- Docker での開発環境完結

---

---

## 初心者向けセットアップガイド

### 必要な環境

#### システム要件

- **OS**: Windows 10/11, macOS 10.14+, Linux（Ubuntu 18.04+）
- **メモリ**: 最低 4GB（推奨 8GB 以上）
- **ディスク**: 最低 5GB の空き容量

#### 必要ソフトウェア

1. **Docker Desktop**

   - [Windows](https://docs.docker.com/desktop/windows/install/)
   - [macOS](https://docs.docker.com/desktop/mac/install/)
   - [Linux](https://docs.docker.com/engine/install/ubuntu/)（docker-compose 含む）

2. **Git**（ソースコード取得用）

   - [公式サイト](https://git-scm.com/downloads)からダウンロード

3. **テキストエディタ**（推奨）
   - [Visual Studio Code](https://code.visualstudio.com/)

### ステップ 1: プロジェクトの取得

```bash
# 1. ターミナル/コマンドプロンプトを開く
# 2. 作業ディレクトリに移動（例: デスクトップ）
cd ~/Desktop  # macOS/Linux
cd %USERPROFILE%\Desktop  # Windows

# 3. リポジトリをクローン
git clone <repository-url>
cd matsue-onsen-map-temp
```

### ステップ 2: 環境設定

```bash
# 1. 環境変数ファイルを作成
cp .env.sample .env

# 2. 必要に応じて .env ファイルを編集
# （基本的にはそのまま使用可能）
```

#### 📝 .env ファイルの設定説明

- `GOOGLE_MAPS_API_KEY`: 地図機能を使う場合のみ必要
- その他の設定: 初期設定で動作します

Google Maps API キーの取得方法は[こちら](https://developers.google.com/maps/documentation/javascript/get-api-key)

### ステップ 3: Docker 環境の構築

```bash
# 1. Dockerイメージをビルド（初回のみ・時間がかかります）
docker compose build

# 📝 このコマンドの説明:
# - Ruby 3.3.8 の環境を構築
# - Rails 8.0.2 とその他の依存ライブラリをインストール
# - PostgreSQL 15 のデータベースコンテナを準備
# - Redis 7 のキャッシュサーバーを準備
```

### ステップ 4: データベースの準備

```bash
# 1. データベースの作成・初期化（初回のみ）
docker compose run --rm web bundle exec rails db:prepare

# 📝 このコマンドは以下を実行します:
# - データベースの作成（matsue_onsen_development）
# - テーブル構造の作成（マイグレーション実行）
# - サンプルデータの投入（温泉10件、レビュー30件）
```

### ステップ 5: アセットの準備

```bash
# 1. JavaScript・CSS ファイルの準備（初回のみ）
docker compose run --rm web bundle exec rails assets:precompile

# 📝 このコマンドの説明:
# - Tailwind CSS のビルド
# - Stimulus(JavaScript) のビルド
# - アセットファイルの最適化
```

### ステップ 6: アプリケーションの起動

```bash
# 1. 全サービスを起動
docker compose up

# 📝 起動されるサービス:
# - web: Rails アプリ（http://localhost:3000）
# - sidekiq: バックグラウンドジョブ処理
# - db: PostgreSQL データベース
# - redis: Redis キャッシュサーバー

# バックグラウンドで起動する場合
docker compose up -d
```

### ステップ 7: 動作確認

1. ブラウザで http://localhost:3000 にアクセス
2. 「松江市周辺の温泉一覧」が表示されることを確認
3. 検索・地図表示が動作することを確認

---

## トラブルシューティング

### よくある問題と解決方法

#### 1. ポート番号の競合

```bash
# 3000番ポートが使用中の場合
Error: port is already allocated

# 解決方法:
docker compose down  # 既存コンテナを停止
docker compose up     # 再起動
```

#### 2. データベース接続エラー

```bash
# PostgreSQL コンテナが起動していない場合
could not connect to server: Connection refused

# 解決方法:
docker compose restart db  # データベースコンテナを再起動
docker compose logs db     # ログで状況確認
```

#### 3. JavaScript/CSS が反映されない

```bash
# アセットが正しくビルドされていない場合

# 解決方法:
docker compose run --rm web bundle exec rails assets:precompile
docker compose restart web
```

#### 4. 権限エラー（Linux/macOS）

```bash
# Permission denied エラーが発生する場合

# 解決方法:
# .env ファイルで UID/GID を設定
UID=1000  # `id -u` で確認
GID=1000  # `id -g` で確認
```

---

## 開発用コマンド一覧

**重要**: すべてのコマンドは Docker コンテナ内で実行します。`bundle exec` を忘れずに付けてください。

### 基本操作

| タスク               | コマンド                              |
| -------------------- | ------------------------------------- |
| サーバ起動           | `docker compose up`                   |
| バックグラウンド起動 | `docker compose up -d`                |
| サーバ停止           | `Ctrl+C` または `docker compose down` |
| サーバ再起動         | `docker compose restart web`          |
| 完全クリーンアップ   | `docker compose down -v`              |

### 開発・メンテナンス

| タスク                   | コマンド                                                          |
| ------------------------ | ----------------------------------------------------------------- |
| マイグレーション実行     | `docker compose run --rm web bundle exec rails db:migrate`        |
| シードデータ投入         | `docker compose run --rm web bundle exec rails db:seed`           |
| アセットプリコンパイル   | `docker compose run --rm web bundle exec rails assets:precompile` |
| Gem 追加後のインストール | `docker compose run --rm web bundle install`                      |
| テスト実行               | `docker compose run --rm web bundle exec rspec`                   |
| 静的解析（RuboCop）      | `docker compose run --rm web bundle exec rubocop`                 |
| Tailwind CSS 監視モード  | `docker compose run --rm web bin/rails tailwindcss:watch`         |

### 生成系コマンド

| タスク           | コマンド                                                         |
| ---------------- | ---------------------------------------------------------------- |
| モデル作成       | `docker compose run --rm web bundle exec rails g model Xxx`      |
| コントローラ作成 | `docker compose run --rm web bundle exec rails g controller Xxx` |
| Scaffold 生成    | `docker compose run --rm web bundle exec rails g scaffold Xxx`   |

### デバッグ・確認

| タスク           | コマンド                                               |
| ---------------- | ------------------------------------------------------ |
| Rails コンソール | `docker compose run --rm web bundle exec rails c`      |
| DB コンソール    | `docker compose run --rm web bundle exec rails db`     |
| ルーティング確認 | `docker compose run --rm web bundle exec rails routes` |
| ログ確認         | `docker compose logs web`                              |

---

## ⚠️ トラブルシューティング

### JavaScript 機能（Stimulus コントローラー）が動作しない場合

新しい Stimulus コントローラーを追加したり、既存のコントローラーが動作しない場合の対処法：

1. **アセットプリコンパイルの実行**

   ```bash
   docker compose run --rm web bundle exec rails assets:precompile
   ```

2. **サーバーの再起動**

   ```bash
   docker compose restart web
   ```

3. **ブラウザキャッシュのクリア**
   - デベロッパーツールで Network タブの「Disable cache」をチェック
   - または強制リロード（Ctrl+Shift+R / Cmd+Shift+R）

### よくある症状と対処法

- **ボタンを押しても反応しない** → 上記手順 1-2 を実行
- **console.log が表示されない** → Importmap に含まれていない可能性があります
- **JavaScript エラーが発生** → ブラウザのコンソールでエラー内容を確認

---

## 外部 API 設定（オプション）

### Google Maps API（地図表示・ジオコーディング用）

1. Google Cloud Platform でプロジェクトを作成
2. Maps JavaScript API と Geocoding API を有効化
3. API キーを取得
4. `.env`ファイルに設定:

   ```env
   GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

### 郵便番号検索 API

- zipcloud.ibsnet.co.jp の無料 API を使用（設定不要）
- インターネット接続があれば自動で動作

---

## 開発時の注意点

### 重要な原則

- **すべての Rails コマンドは `docker compose run --rm web` 経由で実行**
- **ホスト OS に直接 Ruby 環境をインストールする必要はありません**
- **ファイル変更はホスト側で行い、コマンド実行はコンテナ内で行います**

### アセット管理について

- 新しい JavaScript（Stimulus コントローラー）を追加した場合は、必ずアセットプリコンパイルを実行
- `app/javascript/controllers/index.js`に新しいコントローラーが正しく登録されているか確認
- JavaScript 機能が動作しない場合は、ブラウザのデベロッパーツールでコンソールエラーを確認
- **Tailwind CSS の開発時は以下の監視コマンドを利用すると便利です:**

  ```bash
  docker compose run --rm web bin/rails tailwindcss:watch
  ```

  このコマンドを実行すると、Tailwind CSS の変更がリアルタイムで反映されます。

### 郵便番号・住所機能について

- 郵便番号から住所自動入力機能は zipcloud.ibsnet.co.jp の無料 API を使用
- Google Maps API による住所 → 緯度経度変換機能は API キー設定時に有効化
- 温泉の位置情報検索（半径指定）は `MapService` で実装

---

## 詳細仕様

詳細な仕様については以下のドキュメントを参照してください：

- [プロダクト仕様書](.github/rails/docs/rails_specification.md)
- [システム設計書](.github/rails/docs/system_design.md)
- [UI/UX 仕様書](.github/rails/docs/ui_specification_tailwind.md)
- [実装ガイドライン](.github/rails/docs/implementation_guidelines.md)
- [Getting Started](.github/rails/docs/getting_started.md)
