require "test_helper"

class OnsenTest < ActiveSupport::TestCase
  def build_onsen(name: "テスト温泉", geo_lat: 35.0, geo_lng: 133.0, description: "説明", tags: "タグ1,タグ2")
    Onsen.new(name: name, geo_lat: geo_lat, geo_lng: geo_lng, description: description, tags: tags)
  end

  test "有効なファクトリはバリデーションを通過する" do
    onsen = build_onsen
    assert onsen.valid?
  end

  test "nameは必須" do
    onsen = build_onsen(name: "")
    assert_not onsen.valid?
    assert_includes onsen.errors[:name], "を入力してください"
  end

  test "nameは100文字以内" do
    onsen = build_onsen(name: "あ" * 101)
    assert_not onsen.valid?
  end

  test "geo_lat, geo_lngは必須かつ数値" do
    onsen = build_onsen(geo_lat: nil)
    assert_not onsen.valid?
    onsen = build_onsen(geo_lng: nil)
    assert_not onsen.valid?
    onsen = build_onsen(geo_lat: "abc")
    assert_not onsen.valid?
  end

  test "descriptionは1000文字以内" do
    onsen = build_onsen(description: "a" * 1001)
    assert_not onsen.valid?
  end

  test "tagsは255文字以内" do
    onsen = build_onsen(tags: "a" * 256)
    assert_not onsen.valid?
  end

  test "average_ratingはレビューがなければ0、あれば平均値を返す" do
    onsen = Onsen.create!(name: "温泉", geo_lat: 35, geo_lng: 133)
    assert_equal 0, onsen.average_rating
    onsen.reviews.create!(rating: 4)
    onsen.reviews.create!(rating: 2)
    assert_equal 3, onsen.average_rating
  end
end
