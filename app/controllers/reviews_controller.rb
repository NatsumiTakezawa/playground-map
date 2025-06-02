# レビュー投稿コントローラ
# @see rails/docs/rails_specification.md
class ReviewsController < ApplicationController
  before_action :set_onsen

  # GET /onsens/:onsen_id/reviews/new
  def new
    @review = @onsen.reviews.build
    respond_to do |format|
      format.turbo_stream { render template: "reviews/new" }
      format.html { render partial: "reviews/modal", locals: { review: @review, onsen: @onsen } }
    end
  end

  # POST /onsens/:onsen_id/reviews
  def create
    @review = @onsen.reviews.build(review_params)
    if @review.save
      # Turbo Streams配信ジョブを非同期実行
      ReviewBroadcastJob.perform_later(@review)
      respond_to do |format|
        format.turbo_stream
        format.html { redirect_to onsen_path(@onsen), notice: t('flash.review_created') }
      end
    else
      respond_to do |format|
        format.turbo_stream { render partial: "reviews/modal", locals: { review: @review, onsen: @onsen }, status: :unprocessable_entity }
        format.html { render "onsens/show", status: :unprocessable_entity }
      end
    end
  end

  private
  def set_onsen
    @onsen = Onsen.find(params[:onsen_id])
  end

  def review_params
    params.require(:review).permit(:rating, :comment, images: [])
  end
end
