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
    size: { less_than: 5.megabytes },
    limit: { max: 5 }

  # テキスト・タグ・距離検索
  # @param params [ActionController::Parameters, Hash] :q, :tags, :lat, :lng, :radius_km
  # @return [ActiveRecord::Relation]
  def self.search(params)
    scope = all
    if params[:q].present?
      q = params[:q].strip
      scope = scope.where("name ILIKE :q OR description ILIKE :q", q: "%#{q}%")
    end
    if params[:tags].present?
      tags = params[:tags].split(",").map(&:strip).reject(&:blank?)
      if tags.any?
        tag_query = tags.map { |t| "tags ILIKE ?" }.join(" OR ")
        tag_values = tags.map { |t| "%#{t}%" }
        scope = scope.where(tag_query, *tag_values)
      end
    end
    if params[:lat].present? && params[:lng].present? && params[:radius_km].present?
      lat = params[:lat].to_f
      lng = params[:lng].to_f
      radius = [[params[:radius_km].to_f, 1].max, 50].min # 1〜50km
      # 粗い矩形で絞り込み→Rubyで厳密距離
      lat_delta = radius / 111.0
      lng_delta = radius / (111.0 * Math.cos(lat * Math::PI / 180))
      scope = scope.where(geo_lat: (lat-lat_delta)..(lat+lat_delta), geo_lng: (lng-lng_delta)..(lng+lng_delta))
      scope = scope.select { |onsen| MapService.distance_km(lat, lng, onsen.geo_lat, onsen.geo_lng) <= radius }
    end
    scope
  end

  # @return [Integer] レビューの平均評価（小数点以下四捨五入、レビューがなければ0）
  def average_rating
    return 0 if reviews.empty?
    reviews.average(:rating)&.round || 0
  end
end
