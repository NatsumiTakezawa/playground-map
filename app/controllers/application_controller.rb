
# アプリケーション全体の基底コントローラクラス
#
# すべてのコントローラが継承するベースクラスです。
# Rails アプリケーション全体に適用される共通的な設定や
# セキュリティ対策、ヘルパーメソッドなどを定義します。
#
# @note 初学者向け解説
#   - Rails では、すべてのコントローラは ApplicationController を継承します
#   - ここで定義された設定やメソッドは、全コントローラで自動的に利用可能になります
#   - セキュリティ設定、認証・認可、共通のbefore_actionなどを記述します
#
# @example 基本的な継承パターン
#   class OnsensController < ApplicationController
#     # ApplicationController の機能が全て利用可能
#   end
#
# @see https://railsguides.jp/action_controller_overview.html
# @author 松江市温泉マップ開発チーム
# @since Rails 8.0.2
class ApplicationController < ActionController::Base
    helper_method :current_path

 # @return [String] 現在のページのパス
    def current_path
      request.path
    end
  end
  # モダンブラウザのみアクセス許可
  #
  # Rails 8.0の新機能で、古いブラウザからのアクセスを制限します。
  # webp画像、web push、バッジ、import maps、CSS nesting、CSS :hasを
  # サポートするモダンブラウザのみアクセスを許可します。
  #
  # @note 初学者向け解説
  #   - この設定により、古いブラウザの互換性問題を回避できます
  #   - モダンな機能を安心して使用できるようになります
  #   - 開発効率とユーザー体験の向上が期待できます
  #
  # @see https://guides.rubyonrails.org/configuring.html#config-allow-browser-versions
  # allow_browser versions: :modern




