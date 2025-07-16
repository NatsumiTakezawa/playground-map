class Playground < ApplicationRecord

#写真複数登録のための設定
has_many_attached :photos

#PlaygroundAgeGroupモデルとの関連付け
has_many :playground_age_groups, dependent: :destroy
has_many :age_groups, through: :playground_age_groups

# Genreモデルとの関連付け
belongs_to :genre

end

