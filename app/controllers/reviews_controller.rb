# レビュー投稿コントローラ
# @see rails/docs/rails_specification.md
class ReviewsController < ApplicationController
  # POST /onsens/:onsen_id/reviews
  def create
    @onsen = Onsen.find(params[:onsen_id])
    @review = @onsen.reviews.build(review_params)
    if @review.save
      redirect_to onsen_path(@onsen), notice: t('flash.review_created')
    else
      @reviews = @onsen.reviews.order(created_at: :desc)
      render 'onsens/show', status: :unprocessable_entity, alert: t('flash.review_failed')
    end
  end

  private
  # @return [ActionController::Parameters]
  def review_params
    params.require(:review).permit(:rating, :comment, images: [])
  end
end
