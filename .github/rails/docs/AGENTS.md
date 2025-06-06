# AI エージェント作業指示書 - 松江市温泉マップ並行リファクタリング

## 📋 基本情報

**プロジェクト**: 松江市温泉マップ（Rails 8.0 + Hotwire + Tailwind）
**作業期間**: 2025 年 6 月 6 日〜8 日（3 日間集中）
**作業形態**: 4 ブロック同時並行実行
**目標**: 初学者向けの読みやすいコードベースに改善

---

## 🎯 AI エージェント実行方針

### 前提条件

1. **Docker 環境での作業必須**

   ```bash
   # すべてのコマンドはDocker内で実行
   docker compose run --rm web bundle exec [コマンド]
   ```

2. **段階的実行**

   - 小さな変更を頻繁にコミット
   - 各ステップで動作確認
   - エラー発生時の即座なロールバック

3. **品質保証**
   - 変更後は必ずテスト実行
   - コメントは日本語 + YARD 記法
   - 初学者向けの説明を重視

---

## 🅰️ ブロック A: モデル層改善エージェント

### 作業対象ファイル

- `app/models/onsen.rb`
- `app/models/review.rb`
- `app/services/map_service.rb`
- 新規作成: `app/services/distance_calculator.rb`
- 新規作成: `app/services/address_resolver.rb`
- 新規作成: `app/services/geocoding_service.rb`

### 実行タスク

#### A1. Onsen.search メソッドの scope 分割

**現在の問題**: `Onsen.search`メソッドが複雑で読みづらい

**目標**: 以下の scope に分割

```ruby
# 目標とするscope設計
scope :by_text_search, ->(query) { ... }
scope :by_tag_search, ->(tags) { ... }
scope :by_location_search, ->(params) { ... }
```

**実行手順**:

1. 現在の`search`メソッドを解析
2. テキスト検索部分を`by_text_search`に分離
3. タグ検索部分を`by_tag_search`に分離
4. 位置情報検索部分を`by_location_search`に分離
5. 元の`search`メソッドで新しい scope を組み合わせ
6. テスト実行で動作確認

#### A2. Review モデルの機能拡張

**追加機能**:

```ruby
# 追加すべきscope・メソッド
scope :recent, -> { order(created_at: :desc) }
scope :high_rating, -> { where('rating >= ?', 4) }
scope :with_comments, -> { where.not(comment: [nil, '']) }

def formatted_rating
  "★" * rating + "☆" * (5 - rating)
end
```

#### A3. MapService の責務分離

**分割方針**:

```ruby
# app/services/distance_calculator.rb - 距離計算専用
class DistanceCalculator
  def self.calculate_km(lat1, lng1, lat2, lng2)
    # ハーベルサイン公式実装
  end
end

# app/services/address_resolver.rb - 住所変換
class AddressResolver
  def self.resolve_coordinates(address)
    # 住所→座標変換
  end
end

# app/services/geocoding_service.rb - 外部API連携
class GeocodingService
  def self.geocode(address)
    # Google Geocoding API呼び出し
  end
end
```

### 成功基準

- [ ] 各 scope が期待通りに動作
- [ ] 全テストが通過
- [ ] 複雑度の改善（Cyclomatic Complexity < 10）
- [ ] 日本語コメント充実

---

## 🅱️ ブロック B: ビュー・UI 改善エージェント

### 作業対象ファイル

- `app/views/admin/onsens/index.html.erb`
- `app/views/onsens/show.html.erb`
- 新規作成: `app/views/shared/_onsen_card.html.erb`
- 新規作成: `app/views/shared/_review_card.html.erb`
- `app/helpers/application_helper.rb`

### 実行タスク

#### B1. パーシャル分割・整理

**分割対象**:

```erb
<!-- app/views/shared/_onsen_card.html.erb -->
<div class="onsen-card" data-onsen-id="<%= onsen.id %>">
  <!-- 温泉カードの共通レイアウト -->
</div>

<!-- app/views/shared/_review_card.html.erb -->
<div class="review-card">
  <!-- レビューカードの共通レイアウト -->
</div>
```

#### B2. アクセシビリティ改善

**改善項目**:

```erb
<!-- ARIA属性の追加 -->
<button aria-label="温泉詳細を表示" role="button">
<img alt="<%= onsen.name %>の外観写真" src="...">
<nav aria-label="メインナビゲーション">
```

#### B3. レスポンシブ対応強化

**Tailwind クラス整理**:

```erb
<!-- モバイルファースト設計 -->
<div class="w-full md:w-1/2 lg:w-1/3">
<div class="text-sm md:text-base lg:text-lg">
```

### 成功基準

- [ ] パーシャルの再利用性向上
- [ ] WCAG 2.1 AA 準拠
- [ ] モバイル/デスクトップ両対応

---

## 🅲️ ブロック C: フロントエンド改善エージェント

### 作業対象ファイル

- `app/javascript/controllers/spot_card_controller.js`
- `app/javascript/controllers/modal_controller.js`
- `app/javascript/controllers/application.js`
- `app/assets/stylesheets/application.tailwind.css`

### 実行タスク

#### C1. Stimulus コントローラ改善

**コメント強化例**:

```javascript
// app/javascript/controllers/spot_card_controller.js
/**
 * 温泉カードの インタラクション制御
 *
 * 機能:
 * - カードホバー時のハイライト
 * - 詳細表示モーダルの開閉
 * - 地図連携（ピンとの同期）
 */
export default class extends Controller {
  static targets = ["card", "modal"];

  /**
   * カードにマウスオーバーした時の処理
   * @param {Event} event - マウスイベント
   */
  highlight(event) {
    // 実装
  }
}
```

#### C2. Hotwire 機能拡張

**Turbo Frames 導入**:

```erb
<!-- レビュー部分をTurbo Frameで部分更新 -->
<%= turbo_frame_tag "reviews_#{@onsen.id}" do %>
  <!-- レビューリスト -->
<% end %>
```

#### C3. アセット最適化

**不要 CSS 削除**:

```css
/* 不要なTailwindクラスを特定・削除 */
/* カスタムCSSの@apply変換 */
.btn-primary {
  @apply bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded;
}
```

### 成功基準

- [ ] JavaScript エラーゼロ
- [ ] Hotwire 機能の適切な活用
- [ ] パフォーマンス向上

---

## 🅳️ ブロック D: テスト強化エージェント

### 作業対象ファイル

- `spec/models/onsen_spec.rb`
- `spec/models/review_spec.rb`
- `spec/controllers/onsens_controller_spec.rb`
- `spec/controllers/admin/onsens_controller_spec.rb`
- 新規作成: `spec/system/onsen_management_spec.rb`

### 実行タスク

#### D1. モデルテスト強化

**Onsen モデルテスト例**:

```ruby
# spec/models/onsen_spec.rb
RSpec.describe Onsen, type: :model do
  describe 'scopes' do
    describe '.by_text_search' do
      context '名前での検索' do
        let!(:onsen) { create(:onsen, name: '玉造温泉') }

        it '部分一致で検索できること' do
          result = Onsen.by_text_search('玉造')
          expect(result).to include(onsen)
        end
      end
    end
  end
end
```

#### D2. コントローラテスト追加

**エラーケーステスト**:

```ruby
# spec/controllers/admin/onsens_controller_spec.rb
describe 'POST #create' do
  context '無効なパラメータの場合' do
    let(:invalid_params) { { onsen: { name: '' } } }

    it 'エラーを表示すること' do
      post :create, params: invalid_params
      expect(response).to render_template(:new)
      expect(flash[:alert]).to be_present
    end
  end
end
```

#### D3. システムテスト（統合テスト）

**ユーザーフローテスト**:

```ruby
# spec/system/onsen_management_spec.rb
RSpec.describe '温泉管理', type: :system do
  scenario '管理者が新しい温泉を登録する' do
    visit admin_root_path
    click_on '新規温泉登録'
    fill_in '温泉名', with: '有馬温泉'
    # ... フォーム入力
    click_on '登録'

    expect(page).to have_content '温泉を登録しました'
    expect(page).to have_content '有馬温泉'
  end
end
```

### 成功基準

- [ ] テストカバレッジ 90%以上
- [ ] 全テストが緑で通過
- [ ] エッジケースのテスト網羅

---

## 🔧 共通実行ガイドライン

### 1. 作業開始前チェック

```bash
# 環境確認
docker compose up -d
docker compose run --rm web bundle exec rails db:version

# ブランチ作成
git checkout -b refactor/block-[a|b|c|d]-[日付]
```

### 2. 作業中のベストプラクティス

```bash
# 頻繁なテスト実行
docker compose run --rm web bundle exec rspec

# 段階的コミット
git add -A
git commit -m "feat: Onsenモデルのby_text_searchスコープ追加"

# 動作確認
docker compose up
# ブラウザで http://localhost:3000 確認
```

### 3. エラー対応

```bash
# Dockerコンテナの再起動
docker compose restart

# アセット再構築
docker compose run --rm web bundle exec rails assets:precompile

# データベースリセット（必要時のみ）
docker compose run --rm web bundle exec rails db:reset
```

### 4. 完了時チェック

```bash
# 全テスト実行
docker compose run --rm web bundle exec rspec

# RuboCop チェック
docker compose run --rm web bundle exec rubocop

# コードカバレッジ確認
docker compose run --rm web bundle exec rspec --format html

# 最終動作確認
docker compose up
# 全機能のマニュアルテスト
```

---

## 📊 品質基準

### コード品質

- **コメント**: 日本語 + YARD 記法
- **複雑度**: Cyclomatic Complexity < 10
- **メソッド長**: 20 行以内
- **クラス長**: 100 行以内（モデルは例外）

### テスト品質

- **カバレッジ**: 90%以上
- **テスト種類**: Unit + Integration + System
- **アサーション**: 明確で理解しやすい期待値

### ドキュメント品質

- **README 更新**: 変更に応じて更新
- **コメント充実**: 初学者が理解できるレベル
- **例外処理**: エラーケースの適切な説明

---

## 🚨 緊急時対応

### 作業が滞った場合

1. **他ブロックに移行**: 依存関係のない作業に切り替え
2. **シンプルな変更から**: 大きな変更を避け、小さな改善から
3. **チーム連携**: 困った時は他のエージェントと連携

### 環境問題が発生した場合

```bash
# Dockerトラブル時
docker system prune -f
docker compose down
docker compose build --no-cache
docker compose up
```

### テスト失敗時

```bash
# 段階的ロールバック
git stash
docker compose run --rm web bundle exec rspec
# 問題箇所の特定と修正
```

---

## 📈 成果測定

### 定量的指標

- **コード行数**: 各ファイル 20%削減目標
- **複雑度**: 全メソッドが 10 未満
- **テストカバレッジ**: 90%以上達成
- **レスポンス時間**: 現状維持または改善

### 定性的指標

- **可読性向上**: 初学者がコードを理解できる
- **保守性向上**: 新機能追加が容易
- **拡張性確保**: 将来の機能追加に備えた設計
- **学習効果**: 教材としての価値向上

---

## 📝 報告フォーマット

### 日次報告テンプレート

```markdown
## [ブロック X] 日次作業報告 - [日付]

### 完了タスク

- [ ] タスク 1: 詳細説明
- [ ] タスク 2: 詳細説明

### 進行中タスク

- [ ] タスク 3: 現在の状況・課題

### 明日の予定

- [ ] タスク 4: 予定作業内容

### 課題・質問

- 課題 1: 具体的な内容と解決策案
- 質問 1: 確認が必要な事項

### メトリクス

- テストカバレッジ: XX%
- コード行数変化: +XX/-XX 行
- 実行時間: XX 時間 XX 分
```

---

**更新日**: 2025 年 6 月 6 日
**次回更新**: 各ブロック完了時
**担当**: AI エージェント（A/B/C/D）
