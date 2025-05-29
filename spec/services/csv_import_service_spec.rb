# frozen_string_literal: true
require 'rails_helper'
require 'tempfile'

RSpec.describe CsvImportService, type: :service do
  describe '.call' do
    let(:valid_csv) do
      Tempfile.new(['onsens', '.csv']).tap do |f|
        f.write("name,geo_lat,geo_lng,description,tags\nテスト温泉,35.0,133.0,説明,タグ1")
        f.rewind
      end
    end
    let(:invalid_csv) do
      Tempfile.new(['onsens', '.csv']).tap do |f|
        f.write("name,geo_lat,geo_lng\n,35.0,133.0")
        f.rewind
      end
    end

    after { valid_csv.close!; invalid_csv.close! }

    it '正常なCSVなら1件インポートされる' do
      result = described_class.call(valid_csv)
      expect(result[:results].count { |r| r[:success] }).to eq 1
      expect(result[:skipped]).to eq 0
    end

    it '必須項目不足の行はスキップされる' do
      result = described_class.call(invalid_csv)
      expect(result[:results].count { |r| r[:success] }).to eq 0
      expect(result[:skipped]).to eq 1
    end
  end
end
