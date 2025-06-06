
# レビュー投稿コントローラ
#
# 温泉に対するレビューの投稿機能を提供するコントローラです。
# Hotwire（Turbo）を活用してSPAライクな操作性を実現しています。
#
# @note 初学者向け解説
#   - ネストしたリソースとして実装（/onsens/:onsen_id/reviews）
#   - before_action で共通処理（温泉の取得）を実行
#   - Turbo Streamsでページリロードなしのレビュー投稿を実現
#   - Active Jobを使用したバックグラウンド処理でリアルタイム更新
#
# @example 利用可能なルート
#   GET /onsens/:onsen_id/reviews/new    # レビュー投稿フォーム表示
#   POST /onsens/:onsen_id/reviews       # レビュー作成
#
# @see rails/docs/rails_specification.md
# @see ReviewBroadcastJob レビューのリアルタイム配信
# @author 松江市温泉マップ開発チーム
# @since Rails 8.0.2
class ReviewsController < ApplicationController
  # リクエスト前の共通処理
  #
  # 全アクションの実行前にレビュー対象の温泉を取得します。
  #
  # @note 初学者向け解説
  #   - before_action はRailsのコールバック機能
  #   - 重複するコードを削減し、DRY原則を守る
  #   - private メソッドを指定することで処理を共通化
  before_action :set_onsen

  # レビュー投稿フォーム表示
  #
  # 新規レビューの投稿フォームを表示します。
  # Turbo StreamとHTML形式の両方に対応し、モーダル表示を実現します。
  #
  # @note アクション詳細
  #   - GET /onsens/:onsen_id/reviews/new でアクセス
  #   - Turbo Stream形式: モーダルウィンドウとして表示
  #   - HTML形式: パーシャルとして表示（非JavaScript環境対応）
  #
  # @note 初学者向け解説
  #   - @onsen.reviews.build でアソシエーションを活用した新規オブジェクト作成
  #   - respond_to でレスポンス形式ごとに処理を分岐
  #   - Turbo Streamでページリロードなしの動的表示を実現
  #
  # @param onsen_id [Integer] 温泉ID（URLパスパラメータ）
  # @return [void] レビュー投稿フォームを表示
  #
  # @example アクセス例
  #   GET /onsens/1/reviews/new  # ID=1の温泉にレビュー投稿フォーム
  #
  # @see https://turbo.hotwired.dev/ Hotwire Turbo公式ドキュメント
  def new
    # アソシエーションを活用して新規レビューオブジェクトを作成
    @review = @onsen.reviews.build

    # レスポンス形式に応じて適切な表示方法を選択
    respond_to do |format|
      # Turbo Stream（JavaScript有効時）: 動的モーダル表示
      format.turbo_stream { render template: "reviews/new" }

      # HTML（JavaScript無効時）: パーシャルとして表示
      format.html { render partial: "reviews/modal", locals: { review: @review, onsen: @onsen } }
    end
  end

  # レビュー作成処理
  #
  # 送信されたレビューデータを保存し、成功時はリアルタイム配信を行います。
  # バリデーションエラー時は適切なエラー表示を行います。
  #
  # @note アクション詳細
  #   - POST /onsens/:onsen_id/reviews でアクセス
  #   - Strong Parametersでセキュリティを確保
  #   - 成功時: Active Jobでリアルタイム配信、Turbo Streamで画面更新
  #   - 失敗時: バリデーションエラーを表示
  #
  # @note 初学者向け解説
  #   - review_params でStrong Parametersを使用（セキュリティ対策）
  #   - @review.save でデータベースへの保存とバリデーション実行
  #   - Active Job（ReviewBroadcastJob）でバックグラウンド処理
  #   - respond_to で成功・失敗時の処理を分岐
  #
  # @param onsen_id [Integer] 温泉ID（URLパスパラメータ）
  # @param review [Hash] レビューデータ（rating, comment, images）
  # @return [void] 成功時はレビュー反映、失敗時はエラー表示
  #
  # @example 投稿データ例
  #   POST /onsens/1/reviews
  #   { review: { rating: 5, comment: "素晴らしい温泉でした", images: [...] } }
  #
  # @see review_params Strong Parametersメソッド
  # @see ReviewBroadcastJob リアルタイム配信ジョブ
  def create
    # アソシエーションを活用してレビューオブジェクトを作成
    @review = @onsen.reviews.build(review_params)

    # バリデーションを実行してデータベースに保存
    if @review.save
      # 保存成功時: バックグラウンドジョブでリアルタイム配信
      ReviewBroadcastJob.perform_later(@review)

      # レスポンス形式に応じて成功時の処理を実行
      respond_to do |format|
        # Turbo Stream: ページリロードなしで画面更新
        format.turbo_stream

        # HTML: 従来のページリダイレクト方式（非JavaScript環境対応）
        format.html { redirect_to onsen_path(@onsen), notice: t("flash.review_created") }
      end
    else
      # 保存失敗時（バリデーションエラー）: エラー内容を表示
      respond_to do |format|
        # Turbo Stream: 専用エラービューでモーダル内にエラー表示
        format.turbo_stream {
          render template: "reviews/create_error",
                 status: :unprocessable_entity
        }

        # HTML: 温泉詳細画面にエラー表示
        format.html { render "onsens/show", status: :unprocessable_entity }
      end
    end
  end

  private

  # レビュー対象の温泉を取得
  #
  # URLパラメータから温泉IDを取得し、対応する温泉オブジェクトを設定します。
  # before_actionで全アクション実行前に呼び出されます。
  #
  # @note 初学者向け解説
  #   - ネストしたリソースでは親リソース（温泉）の取得が必要
  #   - Onsen.find() は見つからない場合に404エラーを自動発生
  #   - @onsen インスタンス変数で全アクションからアクセス可能
  #
  # @return [void] @onsen インスタンス変数を設定
  # @raise [ActiveRecord::RecordNotFound] 指定されたIDの温泉が存在しない場合
  def set_onsen
    @onsen = Onsen.find(params[:onsen_id])
  end

  # Strong Parameters設定
  #
  # セキュリティ対策として、許可されたパラメータのみを受け取ります。
  # Mass Assignment攻撃を防ぎ、意図しないデータの変更を防止します。
  #
  # @note 初学者向け解説
  #   - params.require(:review) でreviewキーの存在を必須とする
  #   - permit() で許可する属性を明示的に指定
  #   - images: [] で配列形式の画像ファイルを許可
  #   - この仕組みにより、悪意のあるパラメータ送信を防止
  #
  # @return [ActionController::Parameters] 許可されたパラメータのみ
  #
  # @example 許可されるパラメータ
  #   { rating: 5, comment: "excellent", images: [file1, file2] }
  #
  # @see https://railsguides.jp/action_controller_overview.html#strong-parameters
  def review_params
    params.require(:review).permit(:rating, :comment, images: [])
  end
end
