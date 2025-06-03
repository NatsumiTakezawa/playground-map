# 地図・距離計算サービス
# @see rails/docs/system_design.md
class MapService
  EARTH_RADIUS_KM = 6371.0

  # 2点間の距離（km）を返す
  # @param lat1 [Float] 緯度1
  # @param lng1 [Float] 経度1
  # @param lat2 [Float] 緯度2
  # @param lng2 [Float] 経度2
  # @return [Float] 距離（km）
  def self.distance_km(lat1, lng1, lat2, lng2)
    lat1_rad = to_rad(lat1)
    lng1_rad = to_rad(lng1)
    lat2_rad = to_rad(lat2)
    lng2_rad = to_rad(lng2)
    dlat = lat2_rad - lat1_rad
    dlng = lng2_rad - lng1_rad
    a = Math.sin(dlat / 2)**2 + Math.cos(lat1_rad) * Math.cos(lat2_rad) * Math.sin(dlng / 2)**2
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    (EARTH_RADIUS_KM * c).round(3)
  end

  def self.to_rad(deg)
    deg.to_f * Math::PI / 180
  end

  require 'net/http'
  require 'uri'
  require 'json'

  # 郵便番号から住所を取得する
  # @param zipcode [String] 郵便番号（ハイフンなし・あり両対応）
  # @return [String, nil] 住所（都道府県+市区町村+町域）またはnil
  def self.address_from_zip(zipcode)
    uri = URI.parse("https://zipcloud.ibsnet.co.jp/api/search?zipcode=#{URI.encode_www_form_component(zipcode)}")
    res = Net::HTTP.get_response(uri)
    return nil unless res.is_a?(Net::HTTPSuccess)
    json = JSON.parse(res.body)
    return nil unless json['results'] && json['results'][0]
    r = json['results'][0]
    "#{r['address1']}#{r['address2']}#{r['address3']}"
  rescue StandardError => e
    Rails.logger.warn("[MapService] 郵便番号検索失敗: #{e.message}")
    nil
  end

  # 住所から緯度経度を取得する（Google Geocoding API）
  # @param address [String] 住所
  # @return [Array(Float, Float), nil] [緯度, 経度] または nil
  def self.geocode(address)
    api_key = Rails.application.credentials.dig(:google_maps_api_key) || ENV['GOOGLE_MAPS_API_KEY']
    return nil unless api_key
    uri = URI.parse("https://maps.googleapis.com/maps/api/geocode/json?address=#{URI.encode_www_form_component(address)}&key=#{api_key}&language=ja")
    res = Net::HTTP.get_response(uri)
    return nil unless res.is_a?(Net::HTTPSuccess)
    json = JSON.parse(res.body)
    loc = json.dig('results', 0, 'geometry', 'location')
    return nil unless loc
    [loc['lat'], loc['lng']]
  rescue StandardError => e
    Rails.logger.warn("[MapService] ジオコーディング失敗: #{e.message}")
    nil
  end

  # 郵便番号から緯度経度を取得する
  # @param zipcode [String] 郵便番号
  # @return [Array(Float, Float), nil] [緯度, 経度] または nil
  def self.latlng_from_zip(zipcode)
    address = address_from_zip(zipcode)
    return nil unless address
    geocode(address)
  end
end
