# GitHub Copilot カスタム指示

- **認証・認可は実装しない**。すべて匿名で CRUD 可能。
- JavaScript は Importmap。`bin/importmap pin` を使う。
- Tailwind ユーティリティクラスを多用し、独自 CSS は `@apply` のみ。
- コントローラは次の順序で記述:
  1. パラメータ取得
  2. Service 呼び出し
  3. Turbo Stream / HTML レスポンス
- RSpec では `let` / `subject` 乱用禁止、明示的な期待値を記述。
- コメントは日本語、YARD 形式 (`# @param`, `# @return`) を必須。
- 不要なファイル，ディレクトリを残さないようにすること

  - 不要なファイルが発生した際はすぐに除去すること

- コマンドは必ず Docker 内で実行すること
- コマンドの実行時など、それぞれ意図を言った後に実行してください。
- 考えている場合にも、何をしているか、何を考えているかを伝えるようにしてください。
- 定期的に現在行っていること、TODO などを確認してください。
- ドキュメントと現状では異なることがあります。

  - その場合は、必ずドキュメントを更新するか、現状に合わせてください。

- 参照ドキュメント

  - ([仕様書](./rails/docs/rails_specification.md))
  - ([システム設計書](./rails/docs/system_design.md))
  - ([UI / UX 仕様書（Tailwind + Hotwire）](./rails/docs/ui_specification_tailwind.md))
  - ([実装ガイドライン](./rails/docs/implementation_guidelines.md))
  - ([Getting Started](./rails/docs/getting_started.md))
