class Onsen < ApplicationRecord
  # @!attribute name
  #   @return [String] 温泉名（必須・100文字以内）
  # @!attribute geo_lat
  #   @return [BigDecimal] 緯度（必須・小数6桁）
  # @!attribute geo_lng
  #   @return [BigDecimal] 経度（必須・小数6桁）
  # @!attribute description
  #   @return [String] 説明（任意・1000文字以内）
  # @!attribute tags
  #   @return [String] タグ（任意・カンマ区切り）

  has_many :reviews, dependent: :destroy
  has_many_attached :images

  validates :name, presence: true, length: { maximum: 100 }
  validates :geo_lat, presence: true, numericality: true
  validates :geo_lng, presence: true, numericality: true
  validates :description, length: { maximum: 1000 }, allow_blank: true
  validates :tags, length: { maximum: 255 }, allow_blank: true
  validates :images,
            content_type: ["image/jpeg", "image/png", "image/gif"],
            limit: { max: 5 },
            size: { less_than: 5.megabytes }
end
