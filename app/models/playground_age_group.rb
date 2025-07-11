class PlaygroundAgeGroup < ApplicationRecord

# PlaygroundとAgeGroupの中間テーブル
belongs_to :playground
belongs_to :age_group

end
