# 松江市温泉マップ   実装指示

---

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
