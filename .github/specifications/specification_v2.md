# 松江市温泉マップ プロダクト仕様書（v3・実装完全準拠・再現性保証）

---

## 1. プロダクト概要

- 松江市周辺の温泉を地図＋リストで探し、詳細・レビュー・広告・管理ができる Web アプリ。
- Next.js（App Router）+ Supabase/PostgreSQL + Tailwind CSS + shadcn/ui。
- 仮認証（localStorage/cookie）方式を採用。
- すべての画面・機能・UI・バリデーション・アクセシビリティ要件を本仕様で定義。
- 本仕様書のみで現状実装の完全再現が可能なレベルまで記述。

---

## 2. サイトマップ・画面遷移・認可

### 2.1 画面一覧

| 画面 ID | 画面名               | URL                     | 主コンポーネント例                               | アクセス要件   |
| ------- | -------------------- | ----------------------- | ------------------------------------------------ | -------------- |
| S00     | トップ/温泉マップ    | `/`                     | MapView, SpotCardList, Header, Footer, BannerAd  | 全員           |
| S01     | 温泉詳細             | `/onsen/[id]`           | SpotHeader, ImageCarousel, ReviewList, ReviewBtn | 全員           |
| S02     | レビュー投稿モーダル | モーダル(`/onsen/[id]`) | ReviewModal, StarRatingInput, TextArea, ImageUp  | サインイン必須 |
| S03     | サインイン           | `/auth/signin`          | EmailForm, OAuthButtons                          | 全員           |
| S05     | 管理ダッシュボード   | `/admin`                | AdminMenu, StatsCards, QuickLinks                | admin のみ     |
| S06     | スポット CMS         | `/admin/spots`          | DataTable, FilterBar, CSVImportBtn, Form, Dialog | admin のみ     |

### 2.2 画面遷移ルール

- `/admin`配下は`loginUser.role === 'admin'`のみアクセス可。未ログイン/権限不足は`/auth/signin`へリダイレクト。
- レビュー投稿はサインイン必須。未ログイン時はエラーメッセージ表示。
- サインインはメールアドレスのみ。`admin@example.com`は admin 権限。

---

## 3. 画面・機能仕様（画面単位で詳細記述）

### 3.1 トップ（S00）

#### レイアウト

- ヘッダー（ロゴ・ナビ・サインインボタン）
- メイン：左=MapView(60%)、右=SpotCardList(40%)（md 以上）、SP は Map 全画面＋リスト Drawer
- フッター直上に BannerAd
- フッター（著作権）

#### MapView

- Google Maps 埋め込み。API キー未設定時は明示的なエラー表示。
- 温泉ごとにマーカー表示。マーカーは onsen.geo_lat/geo_lng 必須。
- aria-label="温泉マップ"、tabIndex=0
- マーカーは今後 SpotCard hover 時にバウンス予定（現状未実装）。

#### SpotCardList

- 各温泉をカード表示。props: onsen: {id, name, description, tags[], images[]}
- 画像未設定時は`/file.svg`。alt 属性必須。
- カードクリック/Enter/Space で詳細遷移。
- タグは#tag 形式でバッジ表示。
- aria-label, role="button", tabIndex=0
- カードは hover でシャドウ強調。

#### 無限スクロール

- 実装上は全件表示。今後の拡張で IntersectionObserver 等で対応。

#### アクセシビリティ

- すべての操作はキーボードで可能。コントラスト比 4.5:1 以上。
- 画像は alt 必須。aria 属性・tabIndex 適切に設定。

---

### 3.2 温泉詳細（S01）

#### レイアウト

- Header 共通
- ImageCarousel（画像配列、なければ`/file.svg`/「画像なし」表示）
- SpotHeader（温泉名・平均 ★・レビュー数）
- タグバッジ
- タブ（概要/写真/レビュー）…現状は概要のみ有効
- 概要説明
- ReviewList（ユーザー名/★/コメント/日付/画像）
- 「レビューを書く」ボタン（モーダル起動）
- BannerAd
- Footer 共通

#### ReviewList

- 各レビュー：ユーザー画像（なければ`/file.svg`）、ユーザー名、★、コメント、日付
- レビューがない場合は「レビューはまだありません」表示
- レビューは最新順で表示
- 1 レビューあたり：props: {id, onsen_id, user_id, rating, comment, created_at}

#### WriteReviewButton

- サインイン済みのみ有効。未サインイン時はエラー表示。
- ボタンは固定 CTA として下部に表示。

---

### 3.3 レビュー投稿モーダル（S02）

#### UI

- StarRatingInput（1-5 星、hover/キーボード可、aria-label="評価"）
- コメント textarea（必須）
- 画像アップロード（1 枚、任意）
- 投稿ボタン（バリデーション：星・コメント必須、disabled 制御）
- エラー時は赤字で表示（data-testid="error-message"）

#### バリデーション

- rating: 1-5 のみ許容
- comment: 1 文字以上
- 画像: image/\*のみ許容、1 枚まで
- 投稿時はサインイン必須。未サインイン時は「投稿にはサインインが必要です」エラー。
- 画像アップロード失敗時は「画像アップロードに失敗しました: ...」エラー。
- 投稿失敗時は「投稿に失敗しました: ...」エラー。

#### 投稿処理

- サインイン必須。未サインイン時は「投稿にはサインインが必要です」エラー。
- 画像は Supabase Storage にアップロード。失敗時はエラー表示。
- 成功時はモーダル閉じてリロード。

#### アクセシビリティ

- すべてのフォーム要素に label, aria 属性。tabIndex 適切。
- キーボード操作で全て完結。

---

### 3.4 サインイン（S03）

#### UI

- メールアドレス入力のみ
- サインインで localStorage に`loginUser`保存
- `admin@example.com`は admin 権限
- OAuth ボタンは UI のみ（現状未実装）

#### バリデーション

- メール形式のみ許容
- 入力エラー時は赤字で表示

#### サインイン処理

- 入力メールがadmin@example.comなら role:admin, それ以外は role:user
- サインイン成功時はトップへ遷移
- サインアウト時は localStorage から削除

---

### 3.5 管理ダッシュボード（S05）

- サイドバー＋ StatsCards（スポット数/レビュー数/広告数: ダミー値）
- QuickLinks（スポット CMS/広告/テーマ）
- RBAC: localStorage で判定
- 未認証時は`/auth/signin`へリダイレクト

---

### 3.6 スポット CMS（S06）

#### DataTable

- 温泉一覧（ID/名前/緯度/経度/タグ/編集/削除/画像）
- 画像未設定時は`/file.svg`
- 編集/削除ボタン
- 検索バー（温泉名で部分一致）
- CSV インポートボタン
- テーブルは overflow-x-auto で横スクロール可

#### 新規作成・編集フォーム

- Dialog で表示
- name, geo_lat, geo_lng 必須
- description, tags（カンマ区切り → 配列）
- バリデーション：未入力時はエラー（data-testid="error-message"）
- 保存/登録ボタン、キャンセルボタン

#### 削除

- 削除ボタン押下で確認ダイアログ
- 確認後のみ削除

#### CSV インポート

- CSV ファイル選択 → プレビュー → 一括登録
- 必須項目不足時はエラー
- tags はカンマ区切り → 配列
- エラーは赤字で表示（data-testid="error-message"）
- CSV プレビューはテーブル表示

#### アクセシビリティ

- aria, alt, tabIndex, コントラスト比 4.5:1 以上
- フォーム要素は label, aria 属性必須

---

## 4. データモデル・型定義

- `src/lib/supabase.types.ts`に準拠
- Onsen: { id, name, geo_lat, geo_lng, description, tags[], images[] }
- Review: { id, onsen_id, user_id, rating, comment, created_at }
- AdBanner: { id, image_url, link_url, start_at, end_at, placement }
- Theme: { id, name, slug, primary_color, assets }
- User: { id, name, email, role }
- バリデーション: name/geo_lat/geo_lng 必須、tags はカンマ区切り → 配列
- 各テーブルの Insert/Update 型も supabase.types.ts 参照

---

## 5. 認証・認可仕様

- サインイン画面はメールアドレスのみ（パスワード不要）
- サインイン時 localStorage に`loginUser`（{ email, role }）保存
- サインアウト時は削除
- 管理画面は`loginUser.role === 'admin'`のみアクセス可
- サインイン状態は localStorage/cookie のみで判定
- Supabase Auth や DB 認証は現状未使用
- E2E テストも仮認証方式に合わせる

---

## 6. UI デザイン・Atomic Design

- Tailwind CSS + shadcn/ui
- Atomic Design: Atoms(Button, Icon, TextField), Molecules(SpotCard, StarRatingInput), Organisms(MapView, ReviewList), Templates, Pages
- カラーパレット: primary-50/100/500/700, accent-500, gray-900/600
- タイポグラフィ: Noto Sans JP, H1=32px, H2=24px, Body=16px, Caption=12px
- レスポンシブ: 640px/1024px ブレークポイント
- 画像: `/public/images/`に WebP, Placehold は`/file.svg`
- アクセシビリティ: aria, alt, コントラスト 4.5:1 以上, tabIndex
- Storybook で Props/Slots を UI ドキュメント化

---

## 7. テスト仕様

- E2E: Playwright（`e2e/`配下、CRUD/CSV/認証/アクセシビリティ/Placehold 画像/バリデーション/権限）
- ユニット: Jest（`lib/services/onsenService.ts`）
- カバレッジ 80%以上
- CI: GitHub Actions で lint, test, typecheck, build
- テスト用ユーザーは supabase/seed.sql で投入

---

## 8. 開発・運用・OSS

- 開発: Next.js, Supabase, Tailwind, shadcn/ui, Playwright, Jest
- デプロイ: Vercel
- CI: GitHub Actions
- OSS ライセンス: MIT/Apache2.0 明記

---

## 9. 参考・更新履歴

- 旧仕様書: specification.md, ui_specification.md, implementation_specifications.md
- README.md, supabase/types, e2e/各種
- 2025-05-19: v3 仕様書（実装完全準拠・再現性保証）

---

# 付録：画面・コンポーネント詳細（props/状態/エラー/アクセシビリティ）

## S00 トップ/温泉マップ

- MapView: props: onsens: Onsen[]
  - Google Maps API キー未設定時はエラー表示
  - aria-label, tabIndex, コントラスト
- SpotCard: props: onsen: Onsen
  - onClick, onKeyDown(Enter/Space)で詳細遷移
  - 画像未設定時は/file.svg, alt 必須
  - タグは#tag 形式
  - role="button", tabIndex=0

## S01 温泉詳細

- ImageCarousel: props: images: string[], alt: string
  - 画像なし時は「画像なし」表示
- SpotHeader: props: name: string, rating: number, reviewCount: number
- ReviewList: props: reviews: Review[], userMap: Record<string, User>
  - 各レビューにユーザー画像/名前/★/コメント/日付
  - 画像未設定時は/file.svg
- ReviewModalClient: props: onsenId: string
  - サインイン必須、未サインイン時はエラー

## S02 レビュー投稿モーダル

- ReviewModal: props: open: boolean, onClose: fn, onSubmit: fn, error: string|null
  - StarRatingInput: props: value: number, onChange: fn
  - textarea: コメント必須
  - input[type=file]: 画像 1 枚のみ
  - 投稿ボタン: rating/comment 必須で disabled 制御
  - エラーは赤字
  - aria, label, tabIndex

## S06 スポット CMS

- DataTable: props: spots: Onsen[]
  - 画像未設定時は/file.svg
  - 編集/削除ボタン
- フォーム: props: form: Partial<Onsen>, onSubmit: fn
  - name/geo_lat/geo_lng 必須
  - description, tags(カンマ区切り)
  - バリデーションエラーは赤字
- CSVImport: props: onCsv: fn
  - プレビューはテーブル
  - 必須項目不足時はエラー

---

# 付録：エッジケース・例外・アクセシビリティ

- API キー未設定時の地図エラー
- 画像未設定時の Placehold
- サインイン未済でのレビュー投稿
- CSV 必須項目不足時のエラー
- 削除時の確認ダイアログ
- すべてのフォーム・ボタンに aria/label/alt/tabIndex
- コントラスト比 4.5:1 以上
- キーボード操作で全機能利用可

---

# 付録：データフロー・状態遷移

- 温泉一覧取得: supabase.from("onsen").select()
- 詳細取得: supabase.from("onsen").select().eq("id", id)
- レビュー取得: supabase.from("review").select().eq("onsen_id", id)
- レビュー投稿: supabase.from("review").insert({ ... })
- 画像アップロード: supabase.storage.from("reviews").upload(...)
- スポット新規作成: supabase.from("onsen").insert({ ... })
- スポット編集: supabase.from("onsen").update({ ... }).eq("id", id)
- スポット削除: supabase.from("onsen").delete().eq("id", id)
- CSV 一括登録: supabase.from("onsen").insert([...])

---

# 付録：テスト観点

- CRUD/E2E/アクセシビリティ/バリデーション/Placehold 画像/認可/CSV/エラー表示/キーボード操作
- テスト用ユーザー: supabase/seed.sql
- カバレッジ 80%以上

---

# 付録：OSS・ライセンス

- MIT/Apache2.0 明記
- OSS ライブラリは README 等で明示

---

（本仕様書は 2025-05-19 時点の実装を完全に再現可能なレベルで記述。以降の実装・拡張時は本書を随時更新すること）
