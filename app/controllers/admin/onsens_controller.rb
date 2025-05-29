# 管理画面用温泉コントローラ
# @see rails/docs/rails_specification.md
class Admin::OnsensController < ApplicationController
  # コールバックでOnsen取得
  before_action :set_onsen, only: %i[show edit update destroy]

  # GET /admin/onsens
  # 一覧表示
  def index
    @onsens = Onsen.all.order(created_at: :desc)
  end

  # GET /admin/onsens/:id
  # 詳細表示
  def show
  end

  # GET /admin/onsens/new
  # 新規作成フォーム
  def new
    @onsen = Onsen.new
  end

  # GET /admin/onsens/:id/edit
  # 編集フォーム
  def edit
  end

  # POST /admin/onsens
  # 温泉新規作成
  def create
    @onsen = Onsen.new(onsen_params)
    if @onsen.save
      redirect_to admin_onsen_path(@onsen), notice: t('admin.onsens.create.success')
    else
      render :new, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /admin/onsens/:id
  # 温泉更新
  # @return [void]
  def update
    # 画像削除処理
    if params[:onsen][:remove_image_ids].present?
      params[:onsen][:remove_image_ids].each do |img_id|
        image = @onsen.images.find_by(id: img_id)
        image&.purge
      end
    end
    if @onsen.update(onsen_params)
      redirect_to admin_onsen_path(@onsen), notice: t('admin.onsens.update.success')
    else
      render :edit, status: :unprocessable_entity
    end
  end

  # DELETE /admin/onsens/:id
  # 温泉削除
  def destroy
    @onsen.destroy!
    redirect_to admin_onsens_path, status: :see_other, notice: t('admin.onsens.destroy.success')
  end

  # POST /admin/onsens/import
  # CSVインポート
  # @return [void]
  def import
    if params[:file].present?
      @import_result = CsvImportService.call(params[:file])
      skipped = @import_result[:skipped]
      if @import_result[:error]
        flash.now[:alert] = "CSVインポート失敗: #{@import_result[:error]}"
      elsif skipped > 0
        flash.now[:notice] = "インポート完了（#{skipped}行スキップ）"
      else
        flash.now[:notice] = 'インポート完了'
      end
      render :import
    else
      flash[:alert] = 'CSVファイルを選択してください'
      redirect_to admin_onsens_path
    end
  end

  private
  # @param [void]
  # @return [Onsen]
  def set_onsen
    @onsen = Onsen.find(params[:id])
  end

  # Strong Parameters
  # @return [ActionController::Parameters]
  def onsen_params
    params.require(:onsen).permit(:name, :geo_lat, :geo_lng, :description, :tags, images: [])
  end
end
