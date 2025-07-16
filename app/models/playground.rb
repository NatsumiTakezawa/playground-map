class Playground < ApplicationRecord

#写真複数登録のための設定
has_many_attached :photos

#PlaygroundAgeGroupモデルとの関連付け
has_many :playground_age_groups, dependent: :destroy
has_many :age_groups, through: :playground_age_groups

# Genreモデルとの関連付け
belongs_to :genre

# 年齢グループのバリデーション
validates :age_groups, presence: { message: "を1つ以上選択してください" }

# その他のバリデーション
validates :name, presence: true
validates :address, presence: true
validates :genre_id, presence: true
validates :title, presence: true
validates :google_maps_link, presence: true

# 年齢グループのIDを受け取るためのメソッド
def age_group_ids=(ids)
# 空の値を除去
ids = ids.reject(&:blank?)
# 年齢グループを設定
self.age_groups = AgeGroup.where(id: ids)
end

def age_group_ids
age_groups.pluck(:id)
end

end

