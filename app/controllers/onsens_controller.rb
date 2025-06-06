
# 公開側温泉コントローラ
#
# 一般ユーザー向けの温泉情報の閲覧機能を提供するコントローラです。
# 認証不要で、誰でも温泉の検索・一覧表示・詳細表示が可能です。
#
# @note 初学者向け解説
#   - ApplicationController を継承し、基本的なRails機能を利用
#   - RESTful設計に従い、index（一覧）とshow（詳細）のみを実装
#   - CRUD操作のうち、Read（読み取り）のみを担当
#   - 管理機能は Admin::OnsensController で別途実装
#
# @example 利用可能なルート
#   GET /onsens      # 温泉一覧・検索画面
#   GET /onsens/:id  # 温泉詳細画面
#
# @see rails/docs/rails_specification.md
# @see Admin::OnsensController 管理側CRUD操作
# @author 松江市温泉マップ開発チーム
# @since Rails 8.0.2
class OnsensController < ApplicationController
  # 温泉一覧・検索機能
  #
  # 温泉の一覧表示と検索機能を提供します。
  # テキスト検索、タグ検索、位置情報検索に対応しています。
  #
  # @note アクション詳細
  #   - GET /onsens でアクセス
  #   - 検索パラメータを受け取り、条件に合う温泉を表示
  #   - 検索しない場合は全温泉を新しい順で表示
  #
  # @note 初学者向け解説
  #   - params.permit() でStrong Parametersを使用（セキュリティ対策）
  #   - Onsen.search() はモデルで定義されたクラスメソッド
  #   - インスタンス変数 @search_params と @onsens をビューで使用
  #
  # @param q [String] 検索キーワード（任意）
  # @param tags [String] タグ検索（任意、カンマ区切り）
  # @return [void] インスタンス変数を設定してindex.html.erbを表示
  #
  # @example 検索例
  #   GET /onsens?q=玉造温泉&tags=美肌,露天風呂
  #
  # @see Onsen.search モデルの検索メソッド
  def index
    # Strong Parametersで安全なパラメータのみ許可
    @search_params = params.permit(:q, :tags)

    # モデルの検索メソッドを呼び出し、新しい順でソート
    @onsens = Onsen.search(@search_params).order(created_at: :desc)
  end

  # 温泉詳細表示機能
  #
  # 指定された温泉の詳細情報とそのレビュー一覧を表示します。
  # 新しいレビューを投稿するためのフォームも同時に表示します。
  #
  # @note アクション詳細
  #   - GET /onsens/:id でアクセス
  #   - パスパラメータ :id で温泉を特定
  #   - 温泉情報、レビュー一覧、レビュー投稿フォームを表示
  #
  # @note 初学者向け解説
  #   - Onsen.find() はActiveRecordの標準メソッド（見つからない場合は404エラー）
  #   - アソシエーション @onsen.reviews でレビューを取得
  #   - Review.new() で新規レビュー投稿用オブジェクトを作成
  #
  # @param id [Integer] 温泉ID（URLパスパラメータ）
  # @return [void] インスタンス変数を設定してshow.html.erbを表示
  # @raise [ActiveRecord::RecordNotFound] 指定されたIDの温泉が存在しない場合
  #
  # @example アクセス例
  #   GET /onsens/1  # ID=1の温泉詳細を表示
  #
  # @see Review レビューモデル
  # @see ReviewsController レビュー投稿機能
  def show
    # 指定されたIDの温泉を取得（見つからない場合は404エラー）
    @onsen = Onsen.find(params[:id])

    # この温泉のレビューを新しい順で取得
    @reviews = @onsen.reviews.order(created_at: :desc)

    # 新規レビュー投稿用のオブジェクトを作成（フォームで使用）
    @review = Review.new(onsen: @onsen)
  end
end
