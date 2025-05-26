# 公開側温泉コントローラ
# @see rails/docs/rails_specification.md
class OnsensController < ApplicationController
  # GET /onsens
  # 温泉一覧・検索
  def index
    @search_params = params.permit(:q, :tags)
    @onsens = Onsen.search(@search_params).order(created_at: :desc)
  end

  # GET /onsens/:id
  # 温泉詳細
  def show
    @onsen = Onsen.find(params[:id])
    @reviews = @onsen.reviews.order(created_at: :desc)
    @review = Review.new(onsen: @onsen)
  end
end
