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


# 年齢カテゴリ・施設1件のサンプルデータ投入

puts '年齢カテゴリを作成中...'
ag1 = AgeGroup.create!(name: "乳児", min_age: 0, max_age: 1)
ag2 = AgeGroup.create!(name: "幼児", min_age: 2, max_age: 4)
ag3 = AgeGroup.create!(name: "未就学児", min_age: 5, max_age: 6)
ag4 = AgeGroup.create!(name: "小学生", min_age: 7, max_age: 12)

puts '遊び場データを作成中...'
Playground.destroy_all

#Playgroundジャンルの関連付け
# play_genre:
# 0: 公園
# 1: 屋内（ボールプール・屋内遊園地）
# 2: レジャー施設・体験施設（ワークショップ・手作り体験）
# 3: 水遊び
# 4: 文化・教育（博物館・図書館など）
# 5: 児童館・地域福祉センター

pg1 = Playground.create!(
  name: "あそびの杜公園",
  title: "自然の中で思い切り遊べる！",
  address: "富山県〇〇市1-2-3",
  google_maps_link: "https://maps.google.com/?q=あそびの杜公園",
  opening_hours: "9:00〜17:00",
  closed_days: "火曜日",
  parking_area: true,
  free: true,
  site_link: "https://asobi-park.jp",
  play_genre: 1,  
  nursing_room: true,
  diaper_stand: true,
  toilet: true,
  kids_toilet: true,
  baby_keep: false,
  rain: false,
  stroller: true,
  cafe: false,
  bbq: true,
  store: false,
  vending_machine: true,
  bring_own_food: true,
  large_playground: true,
  insect_repellent: false,
  has_grassy_area: true
)




# 関連付け
pg1.age_groups << [ag1, ag2]

puts 'シードデータ投入完了！'
