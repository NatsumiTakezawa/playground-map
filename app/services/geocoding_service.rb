# ジオコーディング専門サービス - 住所⇔座標変換
#
# == 概要
# Google Geocoding APIを利用して、住所文字列と地理座標（緯度・経度）
# の相互変換を行う専門サービスです。温泉登録時の位置情報入力支援、
# 検索時の住所ベース位置指定などで使用されます。
#
# == Google Geocoding API について
# - 提供元: Google Cloud Platform
# - 精度: 世界最高水準の住所認識・座標変換精度
# - 対応地域: 全世界（日本語住所に高い精度）
# - 認証: APIキーによる認証が必要
# - 料金: 従量課金制（月間200ドル分の無料利用枠あり）
#
# == API設定要件
# 1. Google Cloud Console でプロジェクト作成
# 2. Geocoding API の有効化
# 3. APIキーの作成と適切な制限設定
# 4. Rails credentials または環境変数での秘匿管理
#
# @see Admin::OnsensController#create 温泉登録時の座標取得
# @see Onsen.apply_location_search 住所ベース位置検索
# @since 1.0.0
# @author 松江市温泉マップ開発チーム
class GeocodingService
  # Google Geocoding APIのベースURL
  # @note HTTPSプロトコルでセキュアな通信
  GOOGLE_GEOCODING_API_BASE = "https://maps.googleapis.com/maps/api/geocode/json"

  # APIリクエスト時のタイムアウト設定（秒）
  # @note ネットワーク遅延とAPI処理時間を考慮
  API_TIMEOUT_SECONDS = 15

  # 座標精度のランク定義（Google API のgeometry.location_type）
  # @see https://developers.google.com/maps/documentation/geocoding/requests-geocoding
  ACCURACY_LEVELS = {
    "ROOFTOP" => 1,           # 屋上レベル（最高精度）
    "RANGE_INTERPOLATED" => 2, # 範囲補間（高精度）
    "GEOMETRIC_CENTER" => 3,   # 幾何中心（中精度）
    "APPROXIMATE" => 4         # 近似位置（低精度）
  }.freeze

  # 住所から緯度経度を取得（Forward Geocoding）
  #
  # == 機能詳細
  # 日本語住所文字列を受け取り、対応する地理座標を返します。
  # Google の高精度住所認識エンジンにより、部分住所や
  # 表記揺れにも柔軟に対応します。
  #
  # == 住所認識の特徴
  # - 完全住所: "島根県松江市殿町1" → 高精度座標
  # - 部分住所: "松江城" → 大まかな座標
  # - 施設名: "出雲大社" → 施設の座標
  # - 住所揺れ: "松江市殿町" → 適切に補完して座標化
  #
  # == 精度情報の活用
  # 返却される座標には精度情報も含まれ、用途に応じて
  # 精度判定を行うことが可能です。
  #
  # @param address [String] 住所文字列
  #   - 完全住所: "島根県松江市殿町1-1"
  #   - 部分住所: "松江市" "松江城"
  #   - 施設名: "出雲大社" "玉造温泉"
  #   - 空文字・nil: nilを返却
  #
  # @return [Hash, nil] 座標情報ハッシュまたはnil
  #   - 成功時: { lat: 35.4738, lng: 133.0505, accuracy: 'ROOFTOP' }
  #   - 失敗時: nil (APIキー未設定、住所不明、通信エラー等)
  #
  # @example 完全住所のジオコーディング
  #   result = GeocodingService.geocode("島根県松江市殿町1")
  #   # => { lat: 35.4738, lng: 133.0505, accuracy: 'ROOFTOP' }
  #
  # @example 施設名でのジオコーディング
  #   result = GeocodingService.geocode("松江城")
  #   # => { lat: 35.4738, lng: 133.0505, accuracy: 'GEOMETRIC_CENTER' }
  #
  # @example 存在しない住所
  #   result = GeocodingService.geocode("存在しない住所12345")
  #   # => nil
  #
  # @see https://developers.google.com/maps/documentation/geocoding
  # @note APIキー未設定やクォータ超過時はnilを返し、ログに記録
  def self.geocode(address)
    # === 入力値の事前検証 ===
    return nil if address.blank?

    # === APIキーの取得と検証 ===
    api_key = fetch_api_key
    return nil unless api_key

    begin
      # === APIリクエストの準備 ===
      # 住所文字列をURLエンコードし、日本語住所に対応
      encoded_address = URI.encode_www_form_component(address)
      api_url = build_geocoding_url(encoded_address, api_key)
      uri = URI.parse(api_url)

      # === HTTP通信の実行 ===
      response = execute_http_request(uri)
      return nil unless response

      # === JSONレスポンスの解析 ===
      json_data = JSON.parse(response.body)

      # API エラーステータスの確認
      unless json_data["status"] == "OK"
        log_api_error("API Status Error", address, "Status: #{json_data['status']}")
        return nil
      end

      # === 座標データの抽出 ===
      extract_coordinates_with_accuracy(json_data)

    rescue JSON::ParserError => error
      log_api_error("JSON Parse Error", address, error.message)
      nil
    rescue Net::TimeoutError => error
      log_api_error("Timeout Error", address, error.message)
      nil
    rescue StandardError => error
      log_api_error("Unexpected Error", address, error.message)
      nil
    end
  end

  # 緯度経度から住所を取得（Reverse Geocoding）
  #
  # == 機能詳細
  # 地理座標（緯度・経度）を受け取り、その地点の住所を取得します。
  # GPS座標から住所を逆算する際や、地図上のクリック位置から
  # 住所を特定する用途で使用されます。
  #
  # == 住所精度について
  # Google APIは座標に最も近い住所を複数返却します。
  # - 1番目: 最も具体的な住所（番地レベル）
  # - 2番目以降: より大きな行政区域レベル
  # 本メソッドは最も具体的な住所を優先して返却します。
  #
  # @param latitude [Numeric] 緯度（-90.0 〜 90.0）
  # @param longitude [Numeric] 経度（-180.0 〜 180.0）
  #
  # @return [String, nil] 住所文字列またはnil
  #   - 成功時: "島根県松江市殿町1" (最も具体的な住所)
  #   - 失敗時: nil (APIキー未設定、座標無効、通信エラー等)
  #
  # @example 松江城の座標から住所取得
  #   address = GeocodingService.reverse_geocode(35.4738, 133.0505)
  #   # => "島根県松江市殿町1"
  #
  # @example 海上の座標（住所なし）
  #   address = GeocodingService.reverse_geocode(35.0, 134.0)
  #   # => nil
  #
  # @see #geocode Forward Geocoding（住所→座標）
  def self.reverse_geocode(latitude, longitude)
    # === 座標の妥当性検証 ===
    return nil unless valid_coordinates?(latitude, longitude)

    # === APIキーの取得と検証 ===
    api_key = fetch_api_key
    return nil unless api_key

    begin
      # === APIリクエストの準備 ===
      latlng = "#{latitude},#{longitude}"
      api_url = build_reverse_geocoding_url(latlng, api_key)
      uri = URI.parse(api_url)

      # === HTTP通信の実行 ===
      response = execute_http_request(uri)
      return nil unless response

      # === JSONレスポンスの解析 ===
      json_data = JSON.parse(response.body)

      # API エラーステータスの確認
      unless json_data["status"] == "OK"
        log_api_error("Reverse Geocoding Error", "#{latitude},#{longitude}", "Status: #{json_data['status']}")
        return nil
      end

      # === 住所データの抽出 ===
      results = json_data["results"]
      return nil if results.blank?

      # 最も具体的な住所（1番目の結果）を返却
      results.first["formatted_address"]

    rescue JSON::ParserError => error
      log_api_error("JSON Parse Error", "#{latitude},#{longitude}", error.message)
      nil
    rescue Net::TimeoutError => error
      log_api_error("Timeout Error", "#{latitude},#{longitude}", error.message)
      nil
    rescue StandardError => error
      log_api_error("Unexpected Error", "#{latitude},#{longitude}", error.message)
      nil
    end
  end

  # 複数住所の一括ジオコーディング
  #
  # == 用途
  # CSV一括登録や管理画面での複数データ処理において、
  # 効率的な座標変換を行うためのバッチ処理メソッドです。
  #
  # == 実装方針
  # - 各住所を個別に処理（Google APIの利用制限に配慮）
  # - 失敗したものはnilとして結果に含める
  # - 処理順序を保持（入力配列と結果配列のインデックス対応）
  # - API利用制限を考慮した適切な間隔制御
  #
  # @param addresses [Array<String>] 住所文字列の配列
  # @param delay_ms [Integer] 各リクエスト間の待機時間（ミリ秒）
  #
  # @return [Array<Hash, nil>] 座標情報ハッシュの配列
  #
  # @example 複数住所の一括変換
  #   results = GeocodingService.batch_geocode([
  #     "島根県松江市殿町1",
  #     "島根県出雲市大社町杵築東195",
  #     "無効な住所"
  #   ])
  #   # => [
  #   #   { lat: 35.4738, lng: 133.0505, accuracy: 'ROOFTOP' },
  #   #   { lat: 35.4018, lng: 132.6852, accuracy: 'ROOFTOP' },
  #   #   nil
  #   # ]
  def self.batch_geocode(addresses, delay_ms: 100)
    return [] if addresses.blank?

    addresses.map.with_index do |address, index|
      # API利用制限に配慮した間隔制御
      sleep(delay_ms / 1000.0) if index > 0

      geocode(address)
    end
  end

  private

  # APIキーの取得（credentials優先、環境変数フォールバック）
  #
  # == セキュリティ考慮事項
  # 1. Rails credentials（暗号化）を最優先
  # 2. 環境変数をフォールバック
  # 3. APIキー未設定時は適切なログ出力
  #
  # @return [String, nil] APIキーまたはnil
  def self.fetch_api_key
    api_key = Rails.application.credentials.dig(:google_maps_api_key) || ENV["GOOGLE_MAPS_API_KEY"]

    if api_key.blank?
      Rails.logger.warn("[GeocodingService] Google Maps APIキーが設定されていません")
      return nil
    end

    api_key
  end

  # Geocoding API リクエストURLの構築
  #
  # @param encoded_address [String] URLエンコード済み住所
  # @param api_key [String] Google Maps APIキー
  # @return [String] 完全なAPIリクエストURL
  def self.build_geocoding_url(encoded_address, api_key)
    "#{GOOGLE_GEOCODING_API_BASE}?address=#{encoded_address}&key=#{api_key}&language=ja&region=jp"
  end

  # Reverse Geocoding API リクエストURLの構築
  #
  # @param latlng [String] "緯度,経度" 形式の座標文字列
  # @param api_key [String] Google Maps APIキー
  # @return [String] 完全なAPIリクエストURL
  def self.build_reverse_geocoding_url(latlng, api_key)
    "#{GOOGLE_GEOCODING_API_BASE}?latlng=#{latlng}&key=#{api_key}&language=ja&region=jp"
  end

  # HTTP通信の実行（タイムアウト設定付き）
  #
  # @param uri [URI] リクエスト先のURI
  # @return [Net::HTTPResponse, nil] HTTPレスポンスまたはnil
  def self.execute_http_request(uri)
    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = API_TIMEOUT_SECONDS

    response = http.request(Net::HTTP::Get.new(uri.request_uri))

    unless response.is_a?(Net::HTTPSuccess)
      Rails.logger.warn("[GeocodingService] HTTP Error: Status #{response.code}")
      return nil
    end

    response
  end

  # APIレスポンスから座標と精度情報を抽出
  #
  # @param json_data [Hash] Google API からのJSONレスポンス
  # @return [Hash, nil] 座標・精度情報ハッシュまたはnil
  def self.extract_coordinates_with_accuracy(json_data)
    results = json_data["results"]
    return nil if results.blank?

    # 最も精度の高い結果（1番目）を選択
    best_result = results.first
    geometry = best_result["geometry"]
    location = geometry["location"]

    {
      lat: location["lat"].to_f,
      lng: location["lng"].to_f,
      accuracy: geometry["location_type"] || "UNKNOWN"
    }
  end

  # 座標値の妥当性を検証
  #
  # @param latitude [Numeric] 緯度
  # @param longitude [Numeric] 経度
  # @return [Boolean] 有効な座標の場合true
  def self.valid_coordinates?(latitude, longitude)
    lat_f = latitude.to_f
    lng_f = longitude.to_f

    # NaN、Infinityの除外
    return false if lat_f.nan? || lat_f.infinite? || lng_f.nan? || lng_f.infinite?

    # 座標範囲の検証
    (-90..90).cover?(lat_f) && (-180..180).cover?(lng_f)
  end

  # APIエラーの統一ログ出力
  #
  # @param error_type [String] エラーの種別
  # @param input [String] エラーが発生した入力値
  # @param details [String] エラーの詳細情報
  def self.log_api_error(error_type, input, details)
    Rails.logger.warn("[GeocodingService] #{error_type}: 入力=#{input}, 詳細=#{details}")
  end
end
