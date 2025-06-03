
# アプリケーション全体のモデル基底クラス
#
# すべてのモデルクラスが継承するベースクラスです。
# データベース関連の共通設定、バリデーション、
# アソシエーション、スコープなどの共通機能を定義します。
#
# @note 初学者向け解説
#   - Rails では、すべてのモデルは ApplicationRecord を継承します
#   - ActiveRecord::Base の機能（ORM機能）を全て継承します
#   - データベースのテーブルとRubyオブジェクトを自動的にマッピングします
#   - バリデーション、アソシエーション、コールバックなどの機能が使用可能です
#
# @example 基本的な継承パターン
#   class Onsen < ApplicationRecord
#     # データベースの「onsens」テーブルと自動的に対応
#     # ActiveRecordの全機能が利用可能
#     validates :name, presence: true
#     has_many :reviews
#   end
#
# @see https://railsguides.jp/active_record_basics.html
# @see https://railsguides.jp/association_basics.html
# @author 松江市温泉マップ開発チーム
# @since Rails 8.0.2
class ApplicationRecord < ActiveRecord::Base
  # 抽象基底クラスとして設定
  #
  # この設定により、ApplicationRecord自体はデータベースの
  # テーブルに対応せず、他のモデルの基底クラスとしてのみ機能します。
  #
  # @note 初学者向け解説
  #   - primary_abstract_class は、このクラスが直接テーブルに対応しないことを示します
  #   - 子クラス（Onsen、Reviewなど）が実際のテーブルに対応します
  #   - Rails 7.0以降で追加された機能です
  #
  # @see https://guides.rubyonrails.org/active_record_multiple_databases.html
  primary_abstract_class
end
