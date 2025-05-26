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
end
