# GitHub Copilot カスタム指示

- 参照ドキュメント

  - ([仕様書](./rails/docs/rails_specification.md))
  - ([システム設計書](docs/system_design.md))
  - ([UI / UX 仕様書（Tailwind + Hotwire）](docs/ui_specification_tailwind.md))
  - ([実装ガイドライン](docs/implementation_guidelines.md))

- **認証・認可は実装しない**。すべて匿名で CRUD 可能。
- JavaScript は Importmap。`bin/importmap pin` を使う。
- Tailwind ユーティリティクラスを多用し、独自 CSS は `@apply` のみ。
- コントローラは次の順序で記述:
  1. パラメータ取得
  2. Service 呼び出し
  3. Turbo Stream / HTML レスポンス
- RSpec では `let` / `subject` 乱用禁止、明示的な期待値を記述。
- コメントは日本語、YARD 形式 (`# @param`, `# @return`) を必須。
