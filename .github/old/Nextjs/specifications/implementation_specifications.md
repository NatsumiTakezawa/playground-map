# 実装仕様詳細（2025-05-13 更新）

## 1. 管理画面（スポット CMS）

### 1.1 機能要件

- 管理者のみアクセス可能（RBAC: role === 'admin'）
- スポット（温泉）一覧表示（テーブル形式、ページネーション）
- 新規作成（フォーム、バリデーション）
- 編集（既存データの編集フォーム）
- 削除（確認ダイアログ付き）
- CSV 一括インポート（CSV アップロード → プレビュー → 登録）
- 画像未設定時は `/file.svg` を表示
- レスポンシブ：
  - モバイル：テーブル → リスト/カード表示、フォームは Drawer
  - タブレット/PC：テーブル＋サイドフォーム
- アクセシビリティ：
  - aria 属性、キーボード操作、コントラスト比
- E2E テスト：
  - 一覧 → 新規作成 → 編集 → 削除の一連フロー
  - バリデーション・エラー表示
  - Placehold 画像表示
  - 権限がない場合のアクセス拒否

### 1.2 サーバ/クライアント分離

- 一覧・データ取得はサーバコンポーネント
- CRUD 操作は Server Actions（/app/actions/onsen.ts）
- UI はクライアントコンポーネント（フォーム、モーダル、バリデーション）
- API Route（/app/api/onsen/route.ts）は外部連携用

### 1.3 型定義

- `Onsen`型は `lib/supabase.types.ts` に準拠
- サービス層（lib/services/onsenService.ts）で DB 操作
- 例外はカスタム例外でラップ
- JSDoc を必ず記載

### 1.4 テスト・CI/CD

- E2E: Playwright（/e2e/spots-cms.spec.ts）
- ユニット: Jest（lib/services/onsenService.ts）
- カバレッジ 80%以上
- CI: GitHub Actions で lint, test, typecheck, build
- OSS ライセンス: MIT/Apache2.0 明記

---

## 2. 認証（簡易実装）

- サインイン/サインアップは Email/Password のみ（OAuth は後続）
- ログイン状態は Cookie/Session で管理
- 管理画面は未ログイン時 `/auth/signin` へリダイレクト
- テスト用ユーザーは seed.sql で投入

---

## 3. Placehold 画像・アクセシビリティ

- 画像未設定時は `/file.svg` を必ず表示
- alt 属性・object-fit・サイズ統一
- aria 属性・キーボード操作・コントラスト比 4.5:1 以上

---

## 4. 今後の拡張

- OAuth 認証（Google/Apple）
- RBAC 強化（事業者・レビュアー分岐）
- 広告管理・テーマ複製・CSV 一括インポートの E2E テスト
- 多言語対応（ja/en）
- Stripe 連携・クリック課金広告

---

## 5. 参考

- 仕様書: .github/specifications/specification.md
- UI 仕様書: .github/specifications/ui_specification.md
- 実装指示: .github/specifications/implementation_specifications.md

---

（このファイルは実装・テスト進捗に応じて随時更新すること）

## 仮認証・認可仕様（2025-05-13 追記）

### 認証

- サインイン画面（/auth/signin）は「メールアドレス」入力のみで OK（パスワード不要）
- サインイン時、localStorage（または cookie）に `loginUser` オブジェクト（{ email, role }）を保存
  - `admin@example.com` の場合は role: 'admin'、それ以外は role: 'user'
- サインアウト時は localStorage から `loginUser` を削除

### 認可

- 管理画面（/admin 配下）は、localStorage の `loginUser.role === 'admin'` のみアクセス可
- 未ログインまたは権限不足時は `/auth/signin` へリダイレクト
- サインイン状態は localStorage/cookie のみで判定し、Supabase Auth や DB は一切使わない

### テスト

- E2E テストも仮認証方式に合わせて修正すること

---

（この仕様は本番用の認証実装前の仮実装であり、セキュリティ要件は考慮しない）
