# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Onsen, type: :model do
  describe 'バリデーション' do
    it '有効なファクトリの場合は有効' do
      onsen = described_class.new(name: 'テスト温泉', geo_lat: 35.0, geo_lng: 133.0)
      expect(onsen).to be_valid
    end

    it 'nameが空なら無効' do
      onsen = described_class.new(name: nil, geo_lat: 35.0, geo_lng: 133.0)
      expect(onsen).not_to be_valid
      expect(onsen.errors[:name]).to be_present
    end

    it 'geo_latが空なら無効' do
      onsen = described_class.new(name: 'テスト温泉', geo_lat: nil, geo_lng: 133.0)
      expect(onsen).not_to be_valid
      expect(onsen.errors[:geo_lat]).to be_present
    end

    it 'geo_lngが空なら無効' do
      onsen = described_class.new(name: 'テスト温泉', geo_lat: 35.0, geo_lng: nil)
      expect(onsen).not_to be_valid
      expect(onsen.errors[:geo_lng]).to be_present
    end
  end
end
