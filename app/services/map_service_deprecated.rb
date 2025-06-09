
# @!parse
#   # 地理情報・地図機能を提供するサービスクラス
#   #
#   # == 初学者向け解説
#   # このクラスは位置情報に関連する各種計算・変換機能を提供します。
#   # - 球面三角法による正確な距離計算
#   # - 郵便番号 → 住所変換（zipcloud API）
#   # - 住所 → 緯度経度変換（Google Geocoding API）
#   #
#   # == 地理情報システム（GIS）の基礎
#   # 1. 座標系: WGS84（世界測地系）を使用
#   # 2. 距離計算: ハーバーサイン公式による球面距離
#   # 3. API連携: 外部サービスとのHTTP通信
#   #
#   # == Service Object としての役割
#   # - 外部API呼び出しの抽象化・統一化
#   # - 地理計算ロジックの集約・再利用
#   # - エラーハンドリングの統一化
#   #
#   # @see Onsen.search 位置情報検索での距離計算利用
#   # @since 1.0.0
#   class MapService

require "net/http"
require "uri"
require "json"

# 地図・地理情報サービス - 位置情報の計算・変換統合クラス
#
# == 概要
# このクラスは温泉マップアプリケーションで必要な地理情報処理を
# 統合的に提供するService Objectです。距離計算、住所変換、
# 緯度経度取得など、地図機能の中核となる処理を集約しています。
#
# == 地理情報システム（GIS）の実装
# - 地球を球体として近似した距離計算（ハーバーサイン公式）
# - 複数の外部APIとの連携による住所・座標変換
# - 日本の郵便番号システムに対応した住所検索
#
# == 設計原則
# 1. 精度と性能のバランス: 実用的な精度で高速な計算
# 2. 外部依存の明確化: API障害時の適切なフォールバック
# 3. 設定の柔軟性: 環境に応じたAPI設定切り替え
# 4. エラーの透明性: 詳細なログと適切なnull返却
#
# @see Onsen.search 温泉検索での距離フィルタリング
# @see Admin::OnsensController 住所入力補助機能
# @since 1.0.0
# @author 松江市温泉マップ開発チーム
class MapService
  #
  # == 物理定数定義
  #

  # 地球の平均半径（キロメートル）
  # @note WGS84楕円体の近似値、一般的なGISアプリケーションで使用
  EARTH_RADIUS_KM = 6371.0

  #
  # == 距離計算機能
  #

  # 2点間の球面距離を計算（ハーバーサイン公式）
  #
  # == アルゴリズム詳細
  # ハーバーサイン公式は球面三角法を用いて、球面上の2点間の
  # 最短距離（大圏距離）を計算する数学的手法です。
  # GPS座標から実際の移動距離を求める際に広く使用されます。
  #
  # == 計算精度について
  # - 地球を完全な球として近似（実際は楕円体）
  # - 短距離（数十km以内）では十分な精度
  # - 長距離では若干の誤差が生じる可能性
  # - 温泉検索程度の用途には実用十分
  #
  # == 数学的背景
  # ハーバーサイン公式:
  # a = sin²(Δφ/2) + cos φ1 ⋅ cos φ2 ⋅ sin²(Δλ/2)
  # c = 2 ⋅ atan2( √a, √(1−a) )
  # d = R ⋅ c
  # (φ: 緯度, λ: 経度, R: 地球半径)
  #
  # @param lat1 [Float, String, Numeric] 地点1の緯度（度）
  # @param lng1 [Float, String, Numeric] 地点1の経度（度）
  # @param lat2 [Float, String, Numeric] 地点2の緯度（度）
  # @param lng2 [Float, String, Numeric] 地点2の経度（度）
  #
  # @return [Float] 2点間の距離（キロメートル、小数点以下3桁まで）
  #
  # @example 松江城と出雲大社の距離計算
  #   distance = MapService.distance_km(35.4738, 133.0505, 35.4018, 132.6852)
  #   # => 約23.5km
  #
  # @example 同一地点の距離（ゼロ距離の確認）
  #   distance = MapService.distance_km(35.1234, 133.5678, 35.1234, 133.5678)
  #   # => 0.0
  #
  # @see EARTH_RADIUS_KM 地球半径定数
  # @see #to_rad 度からラジアンへの変換
  def self.distance_km(lat1, lng1, lat2, lng2)
    # === 座標データの前処理 ===
    # 文字列や数値型を浮動小数点数に統一変換
    lat1_rad = to_rad(lat1)
    lng1_rad = to_rad(lng1)
    lat2_rad = to_rad(lat2)
    lng2_rad = to_rad(lng2)

    # === 角度差の計算 ===
    # ラジアン単位での緯度・経度の差分
    delta_lat = lat2_rad - lat1_rad
    delta_lng = lng2_rad - lng1_rad

    # === ハーバーサイン公式の実装 ===
    # 第1項: 緯度差のハーバーサイン
    sin_half_dlat = Math.sin(delta_lat / 2)
    lat_component = sin_half_dlat ** 2

    # 第2項: 経度差と緯度のコサインを考慮したハーバーサイン
    sin_half_dlng = Math.sin(delta_lng / 2)
    lng_component = Math.cos(lat1_rad) * Math.cos(lat2_rad) * (sin_half_dlng ** 2)

    # 合成項 a の計算
    a = lat_component + lng_component

    # === 中心角の計算 ===
    # atan2を使用して数値安定性を確保
    central_angle = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    # === 最終距離の計算 ===
    # 地球半径との積で実際の距離を算出、小数点以下3桁で丸め
    (EARTH_RADIUS_KM * central_angle).round(3)
  end

  # 度数からラジアンへの変換
  #
  # == 単位変換の必要性
  # - GPS座標は通常「度」単位で表現
  # - 三角関数計算は「ラジアン」単位が必要
  # - 1度 = π/180 ラジアン の変換式を適用
  #
  # @param degrees [Numeric] 角度（度）
  # @return [Float] 角度（ラジアン）
  #
  # @example 直角（90度）の変換
  #   MapService.to_rad(90)  # => 1.5707963267948966 (π/2)
  #
  # @example 半回転（180度）の変換
  #   MapService.to_rad(180) # => 3.141592653589793 (π)
  #
  # @see Math::PI 円周率定数
  # @note プライベートメソッドとして設計されていますが、テスト容易性のためpublic
  def self.to_rad(degrees)
    degrees.to_f * Math::PI / 180
  end

  #
  # == 住所・郵便番号変換機能
  #

  # 郵便番号から住所を取得（zipcloud API利用）
  #
  # == API仕様
  # zipcloud（https://zipcloud.ibsnet.co.jp/）は、
  # 日本郵便の郵便番号データベースを基にした無料APIサービスです。
  # - 利用登録不要
  # - リクエスト数制限あり（個人利用レベルでは十分）
  # - レスポンス形式: JSON
  #
  # == データ品質について
  # - 日本郵便公式データに基づく高い精度
  # - 住所変更の反映に若干のタイムラグ
  # - 廃止された郵便番号は検索不可
  #
  # @param zipcode [String] 郵便番号
  #   - ハイフンあり: "690-0887"
  #   - ハイフンなし: "6900887"
  #   - どちらの形式でも対応
  #
  # @return [String, nil] 住所文字列または取得失敗時nil
  #   - 成功時: "都道府県名+市区町村名+町域名" の組み合わせ
  #   - 失敗時: nil（ログにエラー詳細を出力）
  #
  # @example 松江市の郵便番号検索
  #   address = MapService.address_from_zip("690-0887")
  #   # => "島根県松江市殿町"
  #
  # @example 存在しない郵便番号
  #   address = MapService.address_from_zip("000-0000")
  #   # => nil
  #
  # @example ハイフンなし形式
  #   address = MapService.address_from_zip("6900887")
  #   # => "島根県松江市殿町"
  #
  # @see https://zipcloud.ibsnet.co.jp/doc/api zipcloud API仕様書
  # @note ネットワークエラーや不正な郵便番号の場合はnilを返す
  def self.address_from_zip(zipcode)
    begin
      # === APIエンドポイントの構築 ===
      # URI.encode_www_form_component でURLエンコード
      encoded_zipcode = URI.encode_www_form_component(zipcode)
      api_url = "https://zipcloud.ibsnet.co.jp/api/search?zipcode=#{encoded_zipcode}"
      uri = URI.parse(api_url)

      # === HTTP通信の実行 ===
      response = Net::HTTP.get_response(uri)

      # レスポンスステータスの確認
      return nil unless response.is_a?(Net::HTTPSuccess)

      # === JSONレスポンスの解析 ===
      json_data = JSON.parse(response.body)

      # レスポンス構造の検証
      return nil unless json_data["results"] && json_data["results"][0]

      # === 住所要素の組み立て ===
      address_data = json_data["results"][0]
      prefecture = address_data["address1"]  # 都道府県
      city = address_data["address2"]        # 市区町村
      town = address_data["address3"]        # 町域

      # 住所要素を結合して返却
      "#{prefecture}#{city}#{town}"

    rescue StandardError => error
      # === エラーハンドリング ===
      # - JSON解析エラー
      # - ネットワーク接続エラー
      # - タイムアウトエラー
      # - 不正なレスポンス形式

      Rails.logger.warn("[MapService] 郵便番号検索エラー: #{error.message}")
      Rails.logger.warn("郵便番号: #{zipcode}")
      nil
    end
  end

  # 住所から緯度経度を取得（Google Geocoding API利用）
  #
  # == Google Geocoding API
  # Googleが提供する高精度なジオコーディングサービスです。
  # - 世界中の住所に対応
  # - 日本語住所の高い認識精度
  # - APIキーによる認証が必要
  # - 利用量に応じた課金制度
  #
  # == API設定について
  # APIキーの取得方法:
  # 1. Google Cloud Consoleでプロジェクト作成
  # 2. Maps JavaScript API & Geocoding API の有効化
  # 3. APIキーの作成と制限設定
  # 4. Rails credentialsまたは環境変数に設定
  #
  # @param address [String] 住所文字列
  #   - 日本語住所: "島根県松江市殿町1"
  #   - 英語住所: "1 Tonomachi, Matsue, Shimane"
  #   - 部分住所: "松江市" (精度は下がる)
  #
  # @return [Array(Float, Float), nil] [緯度, 経度]の配列またはnil
  #   - 成功時: [35.4738, 133.0505] (緯度, 経度)
  #   - 失敗時: nil（APIキー未設定、住所不明等）
  #
  # @example 正確な住所のジオコーディング
  #   coords = MapService.geocode("島根県松江市殿町1")
  #   # => [35.4738, 133.0505]
  #
  # @example 部分住所でのジオコーディング
  #   coords = MapService.geocode("松江城")
  #   # => [35.4738, 133.0505] (だいたいの位置)
  #
  # @example 存在しない住所
  #   coords = MapService.geocode("存在しない住所12345")
  #   # => nil
  #
  # @see https://developers.google.com/maps/documentation/geocoding Google Geocoding API
  # @note APIキー未設定やクォータ超過時はnilを返す
  def self.geocode(address)
    begin
      # === APIキーの取得 ===
      # Rails credentials（暗号化）を優先、環境変数をフォールバック
      api_key = Rails.application.credentials.dig(:google_maps_api_key) || ENV["GOOGLE_MAPS_API_KEY"]

      # APIキー未設定時は即座にnilを返す
      return nil unless api_key

      # === APIリクエストURLの構築 ===
      encoded_address = URI.encode_www_form_component(address)
      api_url = "https://maps.googleapis.com/maps/api/geocode/json?" \
                "address=#{encoded_address}&key=#{api_key}&language=ja"
      uri = URI.parse(api_url)

      # === HTTP通信の実行 ===
      response = Net::HTTP.get_response(uri)

      # レスポンスステータスの確認
      return nil unless response.is_a?(Net::HTTPSuccess)

      # === JSONレスポンスの解析 ===
      json_data = JSON.parse(response.body)

      # 位置情報データの深い階層アクセス
      location_data = json_data.dig("results", 0, "geometry", "location")
      return nil unless location_data

      # === 座標データの抽出 ===
      latitude = location_data["lat"]
      longitude = location_data["lng"]

      [ latitude, longitude ]

    rescue StandardError => error
      # === エラーハンドリング ===
      # - APIキー認証エラー
      # - クォータ超過エラー
      # - JSON解析エラー
      # - ネットワーク接続エラー

      Rails.logger.warn("[MapService] ジオコーディングエラー: #{error.message}")
      Rails.logger.warn("住所: #{address}")
      nil
    end
  end

  # 郵便番号から緯度経度を直接取得（二段階変換）
  #
  # == 機能概要
  # 郵便番号 → 住所 → 緯度経度 の二段階変換を行う
  # 便利メソッドです。内部的に address_from_zip と geocode を
  # 組み合わせて使用します。
  #
  # == 使用場面
  # - フォーム入力で郵便番号のみが分かる場合
  # - 住所入力の手間を省きたい場合
  # - 位置情報検索の起点として郵便番号を使いたい場合
  #
  # @param zipcode [String] 郵便番号（ハイフンあり・なし両対応）
  # @return [Array(Float, Float), nil] [緯度, 経度]またはnil
  #
  # @example 郵便番号から直接座標取得
  #   coords = MapService.latlng_from_zip("690-0887")
  #   # => [35.4738, 133.0505]
  #
  # @example 無効な郵便番号
  #   coords = MapService.latlng_from_zip("000-0000")
  #   # => nil
  #
  # @see #address_from_zip 郵便番号→住所変換
  # @see #geocode 住所→座標変換
  # @note どちらかの変換段階で失敗した場合はnilを返す
  def self.latlng_from_zip(zipcode)
    # 第1段階: 郵便番号 → 住所
    address = address_from_zip(zipcode)
    return nil unless address

    # 第2段階: 住所 → 緯度経度
    geocode(address)
  end

  #
  # == 設計ノート（初学者向け）
  #

  # === Service Object パターンの利点 ===
  # 1. 外部API呼び出しロジックの集約
  # 2. 複雑な数学計算の分離
  # 3. エラーハンドリングの統一
  # 4. モックしやすいテスト構造
  #
  # === 地理情報システムの考慮事項 ===
  # - 座標系の統一（WGS84）
  # - 精度と性能のトレードオフ
  # - 外部API依存の適切な処理
  # - ユーザビリティ（部分住所での検索等）
  #
  # === 拡張可能性 ===
  # - 複数のジオコーディングAPI対応
  # - キャッシュ機能（同一住所の再計算防止）
  # - バッチ処理（一括座標変換）
  # - より高精度な距離計算（楕円体補正）
end
