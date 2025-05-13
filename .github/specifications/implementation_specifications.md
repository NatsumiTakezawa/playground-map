# 実装仕様詳細（2025-05-13 更新）

## 1. 管理画面（スポットCMS）

### 1.1 機能要件
- 管理者のみアクセス可能（RBAC: role === 'admin'）
- スポット（温泉）一覧表示（テーブル形式、ページネーション）
- 新規作成（フォーム、バリデーション）
- 編集（既存データの編集フォーム）
- 削除（確認ダイアログ付き）
- CSV一括インポート（CSVアップロード→プレビュー→登録）
- 画像未設定時は `/file.svg` を表示
- レスポンシブ：
  - モバイル：テーブル→リスト/カード表示、フォームはDrawer
  - タブレット/PC：テーブル＋サイドフォーム
- アクセシビリティ：
  - aria属性、キーボード操作、コントラスト比
- E2Eテスト：
  - 一覧→新規作成→編集→削除の一連フロー
  - バリデーション・エラー表示
  - Placehold画像表示
  - 権限がない場合のアクセス拒否

### 1.2 サーバ/クライアント分離
- 一覧・データ取得はサーバコンポーネント
- CRUD操作はServer Actions（/app/actions/onsen.ts）
- UIはクライアントコンポーネント（フォーム、モーダル、バリデーション）
- API Route（/app/api/onsen/route.ts）は外部連携用

### 1.3 型定義
- `Onsen`型は `lib/supabase.types.ts` に準拠
- サービス層（lib/services/onsenService.ts）でDB操作
- 例外はカスタム例外でラップ

### 1.4 テスト・CI/CD
- E2E: Playwright（/e2e/spots-cms.spec.ts）
- ユニット: Jest（lib/services/onsenService.ts）
- カバレッジ80%以上
- CI: GitHub Actionsでlint, test, typecheck, build
- OSSライセンス: MIT/Apache2.0明記

---

## 2. 認証（簡易実装）
- サインイン/サインアップはEmail/Passwordのみ（OAuthは後続）
- ログイン状態はCookie/Sessionで管理
- 管理画面は未ログイン時 `/auth/signin` へリダイレクト
- テスト用ユーザーはseed.sqlで投入

---

## 3. Placehold画像・アクセシビリティ
- 画像未設定時は `/file.svg` を必ず表示
- alt属性・object-fit・サイズ統一
- aria属性・キーボード操作・コントラスト比4.5:1以上

---

## 4. 今後の拡張
- OAuth認証（Google/Apple）
- RBAC強化（事業者・レビュアー分岐）
- 広告管理・テーマ複製・CSV一括インポートのE2Eテスト
- 多言語対応（ja/en）
- Stripe連携・クリック課金広告

---

## 5. 参考
- 仕様書: .github/specifications/specification.md
- UI仕様書: .github/specifications/ui_specification.md
- 実装指示: .github/specifications/implementation_specifications.md

---

（このファイルは実装・テスト進捗に応じて随時更新すること）
