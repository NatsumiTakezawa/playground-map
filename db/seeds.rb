# frozen_string_literal: true
# 温泉10件・レビュー30件のサンプルデータ投入
# @see rails/docs/rails_specification.md

require 'faker'

ActiveRecord::Base.transaction do
  puts '温泉データを作成中...'
  Onsen.destroy_all
  Review.destroy_all

  10.times do |i|
    onsen = Onsen.create!(
      name: "松江温泉#{i+1}",
      geo_lat: 35.46 + rand(-0.05..0.05).round(6),
      geo_lng: 133.05 + rand(-0.05..0.05).round(6),
      description: Faker::Lorem.paragraph(sentence_count: 3),
      tags: %w[美肌 露天 眺望 家族向け].sample(2).join(',')
    )
    puts "  - #{onsen.name}"
    # 各温泉に3件ずつレビュー
    3.times do
      Review.create!(
        onsen: onsen,
        rating: rand(1..5),
        comment: Faker::Lorem.sentence(word_count: 10)
      )
    end
  end
end
puts 'シード投入完了！'
