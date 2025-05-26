# frozen_string_literal: true
# CSVインポートサービス
# @see rails/docs/rails_specification.md
require 'csv'

class CsvImportService
  # @param [ActionDispatch::Http::UploadedFile, StringIO, File] file CSVファイル
  # @return [Array<Hash>] インポート結果（成功: true/false, 行番号, エラー内容）
  def self.call(file)
    results = []
    skipped = 0
    CSV.foreach(file.path, headers: true, encoding: 'UTF-8') do |row|
      onsen = Onsen.new(row.to_h.slice('name', 'geo_lat', 'geo_lng', 'description', 'tags'))
      if onsen.save
        results << { success: true, row: $., onsen: onsen }
      else
        skipped += 1
        results << { success: false, row: $., errors: onsen.errors.full_messages }
      end
    end
    { results: results, skipped: skipped }
  rescue => e
    { results: [], skipped: 0, error: e.message }
  end
end
