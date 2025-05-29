# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Review, type: :model do
  describe 'バリデーション' do
    it '有効な場合は保存できる' do
      onsen = Onsen.create!(name: 'テスト温泉', geo_lat: 35.0, geo_lng: 133.0)
      review = described_class.new(onsen: onsen, rating: 4, comment: '良かった')
      expect(review).to be_valid
    end

    it 'ratingが必須' do
      onsen = Onsen.create!(name: 'テスト温泉', geo_lat: 35.0, geo_lng: 133.0)
      review = described_class.new(onsen: onsen, rating: nil)
      expect(review).not_to be_valid
      expect(review.errors[:rating]).to be_present
    end

    it 'ratingが1未満は無効' do
      onsen = Onsen.create!(name: 'テスト温泉', geo_lat: 35.0, geo_lng: 133.0)
      review = described_class.new(onsen: onsen, rating: 0)
      expect(review).not_to be_valid
    end

    it 'ratingが5超は無効' do
      onsen = Onsen.create!(name: 'テスト温泉', geo_lat: 35.0, geo_lng: 133.0)
      review = described_class.new(onsen: onsen, rating: 6)
      expect(review).not_to be_valid
    end

    it 'commentが500文字を超えると無効' do
      onsen = Onsen.create!(name: 'テスト温泉', geo_lat: 35.0, geo_lng: 133.0)
      review = described_class.new(onsen: onsen, rating: 3, comment: 'あ' * 501)
      expect(review).not_to be_valid
    end
  end
end
