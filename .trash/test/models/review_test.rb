require "test_helper"

class ReviewTest < ActiveSupport::TestCase
  def build_review(rating: 3, comment: "良い温泉", onsen: Onsen.new(name: "温泉", geo_lat: 35, geo_lng: 133))
    Review.new(rating: rating, comment: comment, onsen: onsen)
  end

  test "有効なファクトリはバリデーションを通過する" do
    review = build_review
    assert review.valid?
  end

  test "ratingは必須かつ1〜5" do
    review = build_review(rating: nil)
    assert_not review.valid?
    review = build_review(rating: 0)
    assert_not review.valid?
    review = build_review(rating: 6)
    assert_not review.valid?
  end

  test "commentは500文字以内" do
    review = build_review(comment: "a" * 501)
    assert_not review.valid?
  end

  test "onsen_idは必須" do
    review = build_review(onsen: nil)
    assert_not review.valid?
  end
end
