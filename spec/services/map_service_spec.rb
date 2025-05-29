# frozen_string_literal: true
require 'rails_helper'

describe MapService do
  describe '.distance_km' do
    it '同じ座標なら0km' do
      expect(described_class.distance_km(35.0, 133.0, 35.0, 133.0)).to eq 0.0
    end

    it '松江駅-出雲大社間は約34km' do
      # 松江駅: 35.4681, 133.0484 / 出雲大社: 35.4011, 132.6856
      dist = described_class.distance_km(35.4681, 133.0484, 35.4011, 132.6856)
      expect(dist).to be_within(1.0).of(34.0)
    end

    it '緯度1度差は約111km' do
      dist = described_class.distance_km(0, 0, 1, 0)
      expect(dist).to be_within(0.5).of(111.0)
    end

    it '経度1度差（赤道上）は約111km' do
      dist = described_class.distance_km(0, 0, 0, 1)
      expect(dist).to be_within(0.5).of(111.0)
    end

    it '経度1度差（高緯度）は短くなる' do
      dist_equator = described_class.distance_km(0, 0, 0, 1)
      dist_hokkaido = described_class.distance_km(43.0, 141.0, 43.0, 142.0)
      expect(dist_hokkaido).to be < dist_equator
    end
  end
end
