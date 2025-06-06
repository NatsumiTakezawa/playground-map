
# 管理画面用温泉コントローラ
#
# 温泉データの管理機能（CRUD操作）を提供するコントローラです。
# 認証・認可は設けず、誰でも管理操作が可能な学習用仕様となっています。
#
# @note 初学者向け解説
#   - Admin名前空間を使用してルートを整理
#   - RESTful設計に完全準拠（7つの標準アクション）
#   - before_action で共通処理を効率化
#   - Strong Parametersでセキュリティを確保
#   - CSVインポート機能は Admin::CsvImportsController に分離
#
# @example 利用可能なルート
#   GET    /admin/onsens           # 温泉一覧（index）
#   GET    /admin/onsens/:id       # 温泉詳細（show）
#   GET    /admin/onsens/new       # 新規作成フォーム（new）
#   POST   /admin/onsens           # 温泉作成（create）
#   GET    /admin/onsens/:id/edit  # 編集フォーム（edit）
#   PATCH  /admin/onsens/:id       # 温泉更新（update）
#   DELETE /admin/onsens/:id       # 温泉削除（destroy）
#
# @see rails/docs/rails_specification.md
# @see Admin::CsvImportsController CSVインポート専用コントローラ
# @author 松江市温泉マップ開発チーム
# @since Rails 8.0.2
class Admin::OnsensController < ApplicationController
  # リクエスト前の共通処理
  #
  # 個別の温泉を操作するアクション実行前に、対象温泉を取得します。
  #
  # @note 初学者向け解説
  #   - only: で特定のアクションのみに適用
  #   - show, edit, update, destroy は個別の温泉が必要
  #   - index, new, create は全体操作なので対象外
  before_action :set_onsen, only: %i[show edit update destroy]

  # 温泉一覧表示
  #
  # 管理画面での温泉一覧を表示します。
  # 全温泉を新しい順で表示し、基本的な管理操作へのリンクを提供します。
  #
  # @return [void] インスタンス変数を設定してindex.html.erbを表示
  def index
    @onsens = Onsen.all.order(created_at: :desc)
  end

  # 温泉詳細表示
  #
  # 管理画面での温泉詳細情報を表示します。
  # 温泉の全データとレビュー一覧を確認できます。
  #
  # @param id [Integer] 温泉ID（URLパスパラメータ）
  # @return [void] show.html.erbを表示
  # @raise [ActiveRecord::RecordNotFound] 指定されたIDの温泉が存在しない場合
  def show
    # @onsen は before_action :set_onsen で設定済み
  end

  # 新規温泉作成フォーム表示
  #
  # 新しい温泉を登録するためのフォームを表示します。
  #
  # @return [void] インスタンス変数を設定してnew.html.erbを表示
  def new
    @onsen = Onsen.new
  end

  # 温泉編集フォーム表示
  #
  # 既存の温泉情報を編集するためのフォームを表示します。
  #
  # @param id [Integer] 温泉ID（URLパスパラメータ）
  # @return [void] edit.html.erbを表示
  # @raise [ActiveRecord::RecordNotFound] 指定されたIDの温泉が存在しない場合
  def edit
    # @onsen は before_action :set_onsen で設定済み
  end

  # 温泉新規作成処理
  #
  # 新規温泉フォームから送信されたデータを処理し、データベースに保存します。
  #
  # @param onsen [Hash] 温泉データ（name, geo_lat, geo_lng, description, tags, images）
  # @return [void] 成功時はリダイレクト、失敗時はフォーム再表示
  def create
    @onsen = Onsen.new(onsen_params)

    if @onsen.save
      redirect_to admin_onsen_path(@onsen), notice: t('admin.onsens.create.success')
    else
      render :new, status: :unprocessable_entity
    end
  end

  # 温泉更新処理
  #
  # 編集フォームから送信されたデータを処理し、既存の温泉情報を更新します。
  # 画像の削除機能も同時に提供します。
  #
  # @param id [Integer] 温泉ID（URLパスパラメータ）
  # @param onsen [Hash] 更新データ（name, geo_lat, geo_lng, description, tags, images）
  # @param remove_image_ids [Array<String>] 削除する画像IDの配列（任意）
  # @return [void] 成功時はリダイレクト、失敗時はフォーム再表示
  # @raise [ActiveRecord::RecordNotFound] 指定されたIDの温泉が存在しない場合
  def update
    # 画像削除処理（更新前に実行）
    handle_image_removal if params[:onsen][:remove_image_ids].present?

    if @onsen.update(onsen_params)
      redirect_to admin_onsen_path(@onsen), notice: t('admin.onsens.update.success')
    else
      render :edit, status: :unprocessable_entity
    end
  end

  # 温泉削除処理
  #
  # 指定された温泉をデータベースから削除します。
  # 関連するレビューや画像も同時に削除されます（dependent: :destroy）。
  #
  # @param id [Integer] 温泉ID（URLパスパラメータ）
  # @return [void] 一覧画面にリダイレクト
  # @raise [ActiveRecord::RecordNotFound] 指定されたIDの温泉が存在しない場合
  # @raise [ActiveRecord::RecordNotDestroyed] 削除に失敗した場合
  def destroy
    @onsen.destroy!
    redirect_to admin_onsens_path, status: :see_other, notice: t('admin.onsens.destroy.success')
  end

  private

  # 温泉オブジェクトの取得
  #
  # URLパラメータから温泉IDを取得し、対応する温泉オブジェクトを設定します。
  # before_actionで指定されたアクション実行前に呼び出されます。
  #
  # @return [void] @onsen インスタンス変数を設定
  # @raise [ActiveRecord::RecordNotFound] 指定されたIDの温泉が存在しない場合
  def set_onsen
    @onsen = Onsen.find(params[:id])
  end

  # 画像削除処理
  #
  # パラメータで指定された画像IDに基づいて、温泉の画像を削除します。
  # updateアクションから呼び出され、画像削除ロジックを分離します。
  #
  # @note 初学者向け解説
  #   - params[:onsen][:remove_image_ids] で削除対象の画像IDを取得
  #   - find_by で安全に画像を検索（存在しない場合はnil）
  #   - &演算子でnilチェック付きのpurge実行
  #
  # @return [void] 指定された画像を削除
  def handle_image_removal
    params[:onsen][:remove_image_ids].each do |img_id|
      image = @onsen.images.find_by(id: img_id)
      image&.purge
    end
  end

  # Strong Parameters設定
  #
  # セキュリティ対策として、許可されたパラメータのみを受け取ります。
  # Mass Assignment攻撃を防ぎ、意図しないデータの変更を防止します。
  #
  # @note 許可されるパラメータ
  #   - name: 温泉名（必須）
  #   - geo_lat: 緯度（必須・decimal）
  #   - geo_lng: 経度（必須・decimal）
  #   - description: 説明文（任意・text）
  #   - tags: タグ（任意・カンマ区切り文字列）
  #   - images: 画像ファイル配列（任意・最大5枚）
  #
  # @return [ActionController::Parameters] 許可されたパラメータのみ
  def onsen_params
    params.require(:onsen).permit(:name, :geo_lat, :geo_lng, :description, :tags, images: [])
  end
end
