class AgeGroup < ApplicationRecord

#PlaygroundAgeGroupモデルとの関連付け
has_many :playground_age_groups, dependent: :destroy
has_many :playgrounds, through: :playground_age_groups

end
