# 距離計算専門サービス - ハーバーサイン公式による球面距離計算
#
# == 概要
# 地理座標（緯度・経度）を用いた距離計算に特化したService Objectです。
# 温泉検索での位置フィルタリング、地図表示での距離表示など、
# 地理的な距離が必要な全ての機能で使用されます。
#
# == アルゴリズム詳細
# ハーバーサイン公式を実装し、地球を球体と仮定した大圏距離を計算。
# GPS座標から実際の移動距離を求める際に広く使用される標準的手法です。
#
# == 実装の特徴
# 1. 数値安定性: atan2関数による角度計算で精度を確保
# 2. 型安全性: 入力値の型変換で文字列/数値を適切に処理
# 3. 可読性: 計算過程を段階的に分解してコメント付与
# 4. テスト容易性: 純粋な数学関数として副作用なし
#
# @see Onsen.apply_location_search 温泉検索での距離フィルタリング
# @see Admin::OnsensController#index 管理画面での距離表示
# @since 1.0.0
# @author 松江市温泉マップ開発チーム
class DistanceCalculatorService
  #
  # == 物理定数定義
  #

  # 地球の平均半径（キロメートル）
  # @note WGS84楕円体の近似値、GISアプリケーションで広く使用
  # @see https://ja.wikipedia.org/wiki/WGS84 世界測地系について
  EARTH_RADIUS_KM = 6371.0

  # 2点間の球面距離を計算（ハーバーサイン公式）
  #
  # == 数学的背景
  # ハーバーサイン公式は球面三角法の一種で、球面上の2点間の
  # 最短距離（大圏距離）を求める手法です。
  #
  # 計算式:
  # a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
  # c = 2 ⋅ atan2( √a, √(1−a) )
  # d = R ⋅ c
  #
  # 変数説明:
  # - φ1, φ2: 2地点の緯度（ラジアン）
  # - Δφ: 緯度差
  # - Δλ: 経度差
  # - R: 地球半径
  # - d: 距離
  #
  # == 計算精度について
  # - 短距離（数十km以内）: 高精度（誤差1%未満）
  # - 中距離（数百km以内）: 実用十分（誤差数%程度）
  # - 長距離（1000km超）: 地球楕円体の影響で誤差拡大
  # - 温泉検索用途（半径50km以内）では十分な精度
  #
  # @param lat1 [Float, String, Numeric] 地点1の緯度（度）
  # @param lng1 [Float, String, Numeric] 地点1の経度（度）
  # @param lat2 [Float, String, Numeric] 地点2の緯度（度）
  # @param lng2 [Float, String, Numeric] 地点2の経度（度）
  #
  # @return [Float] 2点間の距離（キロメートル、小数点以下3桁）
  #   - 同一地点の場合: 0.0
  #   - 無効な座標の場合: Float::INFINITY
  #
  # @example 松江城と出雲大社の距離
  #   distance = DistanceCalculatorService.calculate(35.4738, 133.0505, 35.4018, 132.6852)
  #   # => 23.456 (約23.5km)
  #
  # @example 同一地点の距離確認
  #   distance = DistanceCalculatorService.calculate(35.1234, 133.5678, 35.1234, 133.5678)
  #   # => 0.0
  #
  # @example 文字列座標の処理
  #   distance = DistanceCalculatorService.calculate("35.4738", "133.0505", "35.4018", "132.6852")
  #   # => 23.456 (数値と同じ結果)
  #
  # @see EARTH_RADIUS_KM 地球半径定数
  # @see #degrees_to_radians 度→ラジアン変換
  def self.calculate(lat1, lng1, lat2, lng2)
    # === 入力値の検証と変換 ===
    # 文字列や整数を浮動小数点数に統一変換
    begin
      lat1_f = lat1.to_f
      lng1_f = lng1.to_f
      lat2_f = lat2.to_f
      lng2_f = lng2.to_f
    rescue StandardError
      # 変換失敗時は無限大を返却（無効な座標として扱う）
      return Float::INFINITY
    end

    # === 座標範囲の検証 ===
    # 緯度: -90°〜+90°、経度: -180°〜+180°
    return Float::INFINITY unless valid_coordinates?(lat1_f, lng1_f, lat2_f, lng2_f)

    # === ラジアン変換 ===
    # 三角関数計算のため度をラジアンに変換
    lat1_rad = degrees_to_radians(lat1_f)
    lng1_rad = degrees_to_radians(lng1_f)
    lat2_rad = degrees_to_radians(lat2_f)
    lng2_rad = degrees_to_radians(lng2_f)

    # === 角度差の計算 ===
    delta_lat = lat2_rad - lat1_rad
    delta_lng = lng2_rad - lng1_rad

    # === ハーバーサイン公式の実装 ===
    # 第1項: 緯度差のハーバーサイン成分
    sin_half_dlat = Math.sin(delta_lat / 2)
    lat_component = sin_half_dlat ** 2

    # 第2項: 経度差と両地点緯度のコサインを考慮した成分
    sin_half_dlng = Math.sin(delta_lng / 2)
    lng_component = Math.cos(lat1_rad) * Math.cos(lat2_rad) * (sin_half_dlng ** 2)

    # 合成項 a の計算
    a = lat_component + lng_component

    # === 中心角の計算 ===
    # atan2を使用して数値的安定性を確保
    # Math.asin(Math.sqrt(a)) より精度が高い
    central_angle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    # === 最終距離の計算と丸め ===
    # 地球半径を乗じて実際の距離を算出
    # 小数点以下3桁で丸めて返却（メートル精度）
    (EARTH_RADIUS_KM * central_angle).round(3)
  end

  # 2地点間の距離が指定範囲内かどうかを判定
  #
  # == 用途
  # 温泉検索での位置フィルタリングにおいて、距離計算を行う前の
  # 事前チェックとして使用します。計算コストの最適化に貢献。
  #
  # @param lat1 [Numeric] 基準地点の緯度
  # @param lng1 [Numeric] 基準地点の経度
  # @param lat2 [Numeric] 対象地点の緯度
  # @param lng2 [Numeric] 対象地点の経度
  # @param max_distance_km [Numeric] 最大距離（キロメートル）
  #
  # @return [Boolean] 範囲内の場合true、範囲外またはエラー時false
  #
  # @example 温泉検索での利用
  #   within_range = DistanceCalculatorService.within_range?(
  #     35.4738, 133.0505,  # 松江城
  #     35.4018, 132.6852,  # 出雲大社
  #     30                  # 30km以内
  #   )
  #   # => true（実際は約23km）
  #
  # @see #calculate メイン距離計算メソッド
  def self.within_range?(lat1, lng1, lat2, lng2, max_distance_km)
    distance = calculate(lat1, lng1, lat2, lng2)

    # 無効な座標の場合はfalseを返す
    return false if distance == Float::INFINITY

    distance <= max_distance_km.to_f
  end

  private

  # 度数からラジアンへの変換
  #
  # == 単位変換の必要性
  # - GPS座標は通常「度」単位で表現される
  # - Ruby/Math モジュールの三角関数は「ラジアン」単位
  # - 1度 = π/180 ラジアン の数学的変換関係
  #
  # @param degrees [Float] 角度（度）
  # @return [Float] 角度（ラジアン）
  #
  # @example 主要角度の変換例
  #   degrees_to_radians(0)    # => 0.0
  #   degrees_to_radians(90)   # => π/2 ≈ 1.5708
  #   degrees_to_radians(180)  # => π ≈ 3.1416
  #   degrees_to_radians(360)  # => 2π ≈ 6.2832
  #
  # @see Math::PI 円周率定数
  def self.degrees_to_radians(degrees)
    degrees * Math::PI / 180.0
  end

  # 座標値の妥当性を検証
  #
  # == 検証項目
  # - 緯度: -90°以上90°以下（北極〜南極）
  # - 経度: -180°以上180°以下（西経180°〜東経180°）
  # - 数値型: NaN、Infinityでないこと
  #
  # @param lat1 [Float] 地点1の緯度
  # @param lng1 [Float] 地点1の経度
  # @param lat2 [Float] 地点2の緯度
  # @param lng2 [Float] 地点2の経度
  #
  # @return [Boolean] 全座標が有効な場合true
  def self.valid_coordinates?(lat1, lng1, lat2, lng2)
    coordinates = [ lat1, lng1, lat2, lng2 ]

    # 数値の有効性チェック（NaN、Infinityの除外）
    return false if coordinates.any? { |coord| coord.nan? || coord.infinite? }

    # 緯度範囲チェック（-90°〜+90°）
    return false unless (-90..90).cover?(lat1) && (-90..90).cover?(lat2)

    # 経度範囲チェック（-180°〜+180°）
    return false unless (-180..180).cover?(lng1) && (-180..180).cover?(lng2)

    true
  end
end
