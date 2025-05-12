# 松江市温泉マップ   実装指示

---

- クライアントとサーバの分離を意識し、データの取得や操作はサーバ側で行う。
- "use client" と "use server" を適切に使い分け、クライアントコンポーネントとサーバコンポーネントを明確に区別する。
- クライアントサイドの処理について、"use client" を使用して、クライアントコンポーネント内で実行する。付与を忘れないようにする。
- **Server Actions (`use server`) の活用**

  - UI コンポーネント直下でフォーム処理を簡潔に記述：

    ```ts
    // app/actions/onsen.ts
    "use server";
    export async function createOnsen(data: FormData) {
      /*…*/
    }
    ```

  - クライアントコンポーネントでは `<form action={createOnsen}>...</form>` のみで呼び出し可能にする。

- **公開 API は Route Handlers で追加**

  - モバイルアプリや第三者サービス向けには `app/api/.../route.ts` に `GET`・`POST` ハンドラーを実装し、RESTful エンドポイントを提供。
  - 必要に応じて `PUT`・`DELETE` を定義し、HTTP ステータスコードとエラーハンドリングを明示する。

- **型定義とエラーハンドリングの共通化**

  - `src/lib/supabase.types.ts` にデータの型を定義し、Action／API／UI で共有する。
  - サービス層で発生した例外をキャッチし、カスタム例外クラスでラップした上で
    - Server Actions では例外を画面上のメッセージに、
    - API Routes では `NextResponse.json({ error: msg }, { status })` で返却する。

- **データフェッチの最適化**

  - サーバコンポーネント内で直接呼び出しとして、クライアント側の明示的な `fetch` を省略する。
  - `fetch` の `next: { revalidate }` オプションや `cache` 設定でキャッシュ制御を行う。

- **フォルダ構成とレビュー体制**

  - `/app/actions`（Server Actions）、`/app/api`（Route Handlers）、`/lib/services`（ビジネスロジック）、`/components`（UI）を明確に分離。

- **テスト戦略**

  - **ユニットテスト**：`lib/services/onsenService.ts` を Jest などでテスト。
  - **統合テスト**：
    - Server Actions は `@testing-library/react` の `render` + `form` submit で動作検証。
    - API Routes は `supertest` などでエンドポイント呼び出しをテスト。

- **セキュリティ／パフォーマンス注意点**

  - Server Actions は POST 固定かつ同一ドメイン内のみ呼び出せるが、CSRF トークンを付与すると更に安全。
  - 大量データ処理や長時間タスクは外部バッチ／Worker（例: Vercel Functions）へオフロード検討。

- **サーバロジックと API エンドポイントの実装方針**

  - サーバサイドのビジネスロジックは、`/app/actions/`配下に Server Actions（`use server`）として実装する。これにより、UI 直下でフォーム処理やデータ操作を簡潔に記述できる。

    例：

    ```ts
    // app/actions/onsen.ts
    "use server";
    export async function createOnsen(data: FormData) {
      // ...ビジネスロジック...
    }
    ```

    クライアントコンポーネントでは `<form action={createOnsen}>...</form>` のみで呼び出し可能。

  - 外部連携やモバイルアプリ等、RESTful な API エンドポイントが必要な場合は、`/app/api/.../route.ts` に Route Handler として `GET`・`POST` などを実装する。

    例：

    ```ts
    // app/api/onsen/route.ts
    import { NextResponse } from "next/server";
    import { getOnsenList } from "@/app/actions/onsen";
    export async function GET() {
      try {
        const data = await getOnsenList();
        return NextResponse.json(data);
      } catch (e) {
        return NextResponse.json({ error: "サーバエラー" }, { status: 500 });
      }
    }
    ```

  - サーバロジック（Server Actions）と API エンドポイント（Route Handler）は、サービス層（`/lib/services/`）の関数を共通利用し、重複実装を避ける。
  - 詳細な API 設計・エラーハンドリング・型定義は[要件定義書 5.機能要件](./specification.md#5-機能要件)・[要件定義書 7.データモデル](./specification.md#7-データモデルハイレベル)も参照。

---

## 1. ディレクトリ構成・命名規則

- 詳細は[要件定義書 3.システムアーキテクチャ設計](./specification.md#3-システムアーキテクチャ設計)も参照。
- Next.js App Router 構成を基本とし、Atomic Design に基づく UI 分割を徹底。

```text
src/
  app/
    layout.tsx
    globals.css
    page.tsx
    admin/
      page.tsx
      ads/
        page.tsx
      spots/
        page.tsx
        [id]/page.tsx
      themes/
        page.tsx
    auth/
      signin/page.tsx
      signup/page.tsx
    onsen/
      [id]/page.tsx
  components/
    ui/
      card.tsx
      skeleton.tsx
    SpotHeader.tsx
    ImageCarousel.tsx
    ReviewModal.tsx
    StarRatingInput.tsx
    MapView.tsx
    OAuthButtons.tsx
  lib/
    supabaseClient.ts
    supabase.types.ts
    utils.ts
    services/
      onsenService.ts
      reviewService.ts
      adService.ts
  app/actions/
    onsen.ts
    review.ts
    ad.ts
  app/api/
    onsen/route.ts
    review/route.ts
    ad/route.ts
  __tests__/
    components/
    lib/
    app/
public/
  images/
.github/
  workflows/
  specifications/
    implementation_specifications.md
    ui_specification.md
    specification.md
```

- 命名規則: ディレクトリ/ファイルは camelCase または kebab-case、型・コンポーネントは PascalCase、関数・変数は camelCase。

---

## 2. コンポーネント設計・分割方針

- [UI 仕様書 4.コンポーネント設計](./ui_specification.md#4-コンポーネント設計-atomic-design)を参照。
- Atomic Design に基づき、Atoms/Molecules/Organisms/Templates/Pages で分割。
- 主要画面ごとに主コンポーネントを明記。
- UI/UX 設計・アクセシビリティ・レスポンシブは[UI 仕様書 5,6,7](./ui_specification.md#5-ux-原則--デザインシステム)を参照。

---

## 3. 型定義・データモデル

- [要件定義書 7.データモデル](./specification.md#7-データモデルハイレベル)を参照。
- `src/lib/supabase.types.ts`で DB スキーマと同期した型を自動生成・管理。
- サービス層・API・UI で型を共通利用。

---

## 4. サーバ/クライアント分離・データ取得

- サーバコンポーネントでデータ取得・SSR/SSG。
- クライアントコンポーネントは UI 操作・モーダル・フォーム・インタラクション担当。
- Server Actions は`/app/actions/`配下、API Route は`/app/api/`配下。
- 詳細は[要件定義書 6.非機能要件](./specification.md#6-非機能要件)も参照。

---

## 5. サービス層（lib/services/）

- DB アクセスやビジネスロジックはサービス層に集約。
- 例外はカスタム例外クラスでラップし、UI/Action/API で適切にハンドリング。

---

## 6. テスト戦略

- ユニットテスト: サービス層（Jest 推奨）
- 統合テスト: Server Actions（@testing-library/react）、API Route（supertest）
- E2E テスト: Playwright で主要ユースケースを自動化
- カバレッジ: 80%以上を目標
- テストデータ: `supabase/seed.sql` で初期データ投入
- 特に E2E テスト: Playwright については、実際の使用用途に基づき実装時に同時に実装することで、テストの網羅性を高めるとともに、実装の進捗を可視化する。
- [要件定義書 12.スケジュール](./specification.md#12-概算スケジュール)も参照

---

## 7. CI/CD・運用

- CI: GitHub Actions で lint, test, typecheck, build
- CD: Vercel 自動デプロイ（Preview/Production）
- 監視: Sentry, Vercel Analytics
- IaC: 必要に応じて `vercel.json` などで環境管理

---

## 8. アクセシビリティ・国際化

- アクセシビリティ: aria 属性、キーボード操作、コントラスト比
- 多言語対応: i18n（ja/en）を `next-intl` などで段階的に導入
- [UI 仕様書 5,6,7](./ui_specification.md#5-ux-原則--デザインシステム)参照

---

## 9. 拡張性・メンテナンス

- Atomic Design/Storybook で UI 再利用性を担保
- テーマ複製や新規テーマ展開を容易に
- OSS ライセンス: MIT/Apache2.0 優先

---

## 10. 参考資料・運用ルール

- 仕様書・設計書は `.github/specifications/` 配下で管理し、PR レビュー時に必ず参照
- 実装方針や命名で迷った場合は仕様書に追記・議論する

---

> 本仕様書は[要件定義書](./specification.md)・[UI 仕様書](./ui_specification.md)と連携し、実装の Single Source of Truth とする。

---

# 追加実装方針（2025-05-12 追記）

## サービス名・各ページ名・SEO/Metadata 方針

- サービス名: 松江市温泉マップ
- サービス説明: 松江市周辺の温泉を地図・リストで比較し、レビュー・写真・広告など地域情報を一元的に提供する観光支援サービス
- 各ページ名:

  - トップページ: 松江市温泉マップ（温泉一覧・地図）
  - 温泉詳細ページ: [温泉名] | 松江市温泉マップ
  - レビュー投稿: レビューを書く | 松江市温泉マップ
  - サインイン: サインイン | 松江市温泉マップ
  - サインアップ: 新規登録 | 松江市温泉マップ
  - 管理ダッシュボード: 管理ダッシュボード | 松江市温泉マップ
  - スポット CMS: スポット管理 | 松江市温泉マップ
  - 広告管理: 広告管理 | 松江市温泉マップ
  - テーマ管理: テーマ管理 | 松江市温泉マップ

- 各ページで SEO/OGP/アクセシビリティを考慮した Metadata（title, description, og:image, og:type, og:url, twitter:card 等）を設定する。

## Metadata 実装・ページ分離方針

- 各ページは「サーバコンポーネント（metadata, データ取得）」と「クライアントコンポーネント（UI/UX）」に分離する。
  - サーバコンポーネント: `page.tsx`（Next.js App Router の Page）、`generateMetadata`関数で title/description/OGP 等を返す。
  - クライアントコンポーネント: `PageClient.tsx`等で UI/UX・インタラクションを実装。
- 例：
  - `/src/app/onsen/[id]/page.tsx`（サーバ）→ `/src/app/onsen/[id]/PageClient.tsx`（クライアント）
  - `/src/app/page.tsx`（サーバ）→ `/src/app/PageClient.tsx`（クライアント）
- これにより、SEO 最適化・SNS シェア時の OGP・アクセシビリティ向上を両立。

## Placehold 画像・ダミーデータ方針

- 画像が無い場合は必ず`/file.svg`等の美しい placehold 画像を表示する。
- ダミーデータ（seed.sql）は温泉・ユーザー・レビュー・広告・テーマで十分な件数・多様な内容を用意し、各画像も適切に設定。
- Placehold 画像は`public/file.svg`を共通利用し、alt 属性・サイズ・object-fit 等も統一。

## テスト・ビルドエラー対応

- すべてのページ・主要機能で E2E テスト（Playwright）を実装・通過必須。
- ビルドエラー・型エラーは PR 時に必ず解消。
- Metadata/OGP/アクセシビリティもテストで検証。

---
