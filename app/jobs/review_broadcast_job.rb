# Turbo Streamで新規レビューを配信するジョブ
# @see rails/docs/system_design.md
class ReviewBroadcastJob < ApplicationJob
  queue_as :default

  # @param review [Review] 新規レビュー
  # @return [void]
  def perform(review)
    # Turbo Streamsでonsen/showのレビューリストへ配信
    ActionCable.server.broadcast(
      "onsen_#{review.onsen_id}_reviews",
      ApplicationController.render(
        partial: "reviews/review",
        locals: { review: review }
      )
    )
  end
end
