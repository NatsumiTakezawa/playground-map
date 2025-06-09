# frozen_string_literal: true
require "test_helper"

class ReviewsControllerTest < ActionDispatch::IntegrationTest
  fixtures :onsens, :reviews

  setup do
    @onsen = onsens(:one)
  end

  test "レビュー投稿ができる" do
    assert_difference("Review.count") do
      post onsen_reviews_url(@onsen), params: { review: { rating: 5, comment: "最高！" } }
    end
    assert_redirected_to onsen_url(@onsen)
  end
end
