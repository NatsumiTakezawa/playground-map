class Review < ApplicationRecord
  # @!attribute rating
  #   @return [Integer] 評価（必須・1〜5）
  # @!attribute comment
  #   @return [String] コメント（任意・500文字以内）
  # @!attribute onsen_id
  #   @return [Integer] 紐付く温泉ID

  belongs_to :onsen
  has_many_attached :images

  validates :rating, presence: true, inclusion: { in: 1..5 }
  validates :comment, length: { maximum: 500 }, allow_blank: true
  validates :images,
            content_type: ["image/jpeg", "image/png", "image/gif"],
            limit: { max: 3 },
            size: { less_than: 3.megabytes }
end
