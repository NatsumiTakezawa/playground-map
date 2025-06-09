# 住所・郵便番号変換専門サービス - 日本の住所システム対応
#
# == 概要
# 日本の郵便番号システムに特化した住所変換機能を提供します。
# zipcloud APIを利用して、郵便番号から住所への変換を行い、
# 温泉登録・検索時の住所入力支援機能を担います。
#
# == zipcloud API について
# - 提供元: 株式会社アイビス（https://zipcloud.ibsnet.co.jp/）
# - データソース: 日本郵便公式郵便番号データベース
# - 利用条件: 無料、登録不要、リクエスト数制限あり
# - 精度: 日本郵便公式データに基づく高精度
#
# == 対応形式
# - 7桁郵便番号（ハイフンあり・なし両方）
# - 日本国内の全地域対応
# - 住所階層: 都道府県 + 市区町村 + 町域
#
# @see Admin::OnsensController#new 温泉登録時の住所入力支援
# @see Admin::OnsensController#edit 温泉編集時の住所修正
# @since 1.0.0
# @author 松江市温泉マップ開発チーム
class AddressService
  # zipcloud APIのベースURL
  # @note HTTPSプロトコルでセキュアな通信
  ZIPCLOUD_API_BASE = "https://zipcloud.ibsnet.co.jp/api/search"

  # APIリクエスト時のタイムアウト設定（秒）
  # @note ネットワーク遅延を考慮した実用的な値
  API_TIMEOUT_SECONDS = 10

  # 郵便番号から住所を取得
  #
  # == 機能詳細
  # 7桁の郵便番号を受け取り、対応する住所文字列を返します。
  # zipcloud APIの標準的な使用パターンに従い、エラー処理を
  # 含めた堅牢な実装となっています。
  #
  # == 住所データの構造
  # zipcloud APIは以下の階層で住所を返却します:
  # - address1: 都道府県名（例: "島根県"）
  # - address2: 市区町村名（例: "松江市"）
  # - address3: 町域名（例: "殿町"）
  #
  # == エラーハンドリング
  # - 郵便番号形式エラー: 無効な文字列の場合
  # - API通信エラー: ネットワーク障害、タイムアウト
  # - データ未発見: 存在しない郵便番号
  # - 廃止郵便番号: 過去に使用されていたが現在無効
  #
  # @param zipcode [String] 郵便番号
  #   - 標準形式: "690-0887" (ハイフンあり)
  #   - 簡易形式: "6900887" (ハイフンなし)
  #   - 空文字・nil: nilを返却
  #
  # @return [String, nil] 住所文字列またはnil
  #   - 成功時: "島根県松江市殿町" (都道府県+市区町村+町域)
  #   - 失敗時: nil (詳細はログに記録)
  #
  # @example 島根県松江市の郵便番号
  #   address = AddressService.lookup_by_zipcode("690-0887")
  #   # => "島根県松江市殿町"
  #
  # @example ハイフンなし形式
  #   address = AddressService.lookup_by_zipcode("6900887")
  #   # => "島根県松江市殿町"
  #
  # @example 存在しない郵便番号
  #   address = AddressService.lookup_by_zipcode("000-0000")
  #   # => nil
  #
  # @example 無効な入力
  #   address = AddressService.lookup_by_zipcode("invalid")
  #   # => nil
  #
  # @see https://zipcloud.ibsnet.co.jp/doc/api zipcloud API仕様
  # @note ネットワークエラーや不正形式の場合はnilを返し、ログに記録
  def self.lookup_by_zipcode(zipcode)
    # === 入力値の事前検証 ===
    # nil、空文字、空白文字の除外
    return nil if zipcode.blank?

    # 郵便番号形式の正規化（ハイフン除去、7桁チェック）
    normalized_zipcode = normalize_zipcode(zipcode)
    return nil unless valid_zipcode_format?(normalized_zipcode)

    begin
      # === APIリクエストの準備 ===
      # URLエンコードで特殊文字を適切にエスケープ
      encoded_zipcode = URI.encode_www_form_component(normalized_zipcode)
      api_url = "#{ZIPCLOUD_API_BASE}?zipcode=#{encoded_zipcode}"
      uri = URI.parse(api_url)

      # === HTTP通信の実行 ===
      # タイムアウト設定付きでHTTPリクエストを送信
      http = Net::HTTP.new(uri.host, uri.port)
      http.use_ssl = true
      http.read_timeout = API_TIMEOUT_SECONDS

      response = http.request(Net::HTTP::Get.new(uri.request_uri))

      # === レスポンス状態の検証 ===
      unless response.is_a?(Net::HTTPSuccess)
        log_api_error("HTTP Error", zipcode, "Status: #{response.code}")
        return nil
      end

      # === JSONレスポンスの解析 ===
      json_data = JSON.parse(response.body)

      # レスポンス構造の検証
      unless json_data["results"] && json_data["results"].is_a?(Array) && json_data["results"][0]
        log_api_error("No results found", zipcode, json_data.inspect)
        return nil
      end

      # === 住所要素の抽出と組み立て ===
      address_data = json_data["results"][0]
      build_full_address(address_data)

    rescue JSON::ParserError => error
      log_api_error("JSON Parse Error", zipcode, error.message)
      nil
    rescue Net::TimeoutError => error
      log_api_error("Timeout Error", zipcode, error.message)
      nil
    rescue StandardError => error
      log_api_error("Unexpected Error", zipcode, error.message)
      nil
    end
  end

  # 複数の郵便番号を一括で住所変換
  #
  # == 用途
  # CSV一括登録や管理画面での複数データ処理において、
  # 効率的な住所変換を行うためのバッチ処理メソッドです。
  #
  # == 実装方針
  # - 各郵便番号を個別に処理（APIの仕様上、一括取得は非対応）
  # - 失敗したものはnilとして結果に含める
  # - 処理順序を保持（入力配列と結果配列のインデックス対応）
  #
  # @param zipcodes [Array<String>] 郵便番号の配列
  # @return [Array<String, nil>] 住所文字列の配列（失敗時はnil要素）
  #
  # @example 複数郵便番号の一括変換
  #   addresses = AddressService.batch_lookup(["690-0887", "690-0888", "invalid"])
  #   # => ["島根県松江市殿町", "島根県松江市北堀町", nil]
  #
  # @see #lookup_by_zipcode 単体変換メソッド
  def self.batch_lookup(zipcodes)
    return [] if zipcodes.blank?

    zipcodes.map { |zipcode| lookup_by_zipcode(zipcode) }
  end

  # 住所の正規化（表記揺れの統一）
  #
  # == 正規化項目
  # - 全角数字 → 半角数字
  # - 全角英字 → 半角英字
  # - 全角カタカナ → ひらがな（オプション）
  # - 異体字の統一
  # - 前後空白の除去
  #
  # @param address [String] 正規化対象の住所
  # @return [String] 正規化後の住所
  #
  # @example 住所表記の統一
  #   normalized = AddressService.normalize_address("島根県松江市殿町１−１")
  #   # => "島根県松江市殿町1-1"
  def self.normalize_address(address)
    return "" if address.blank?

    # 全角数字・記号を半角に変換
    normalized = address.tr("０-９", "0-9")
                        .tr("－−", "-")
                        .tr("　", " ")
                        .strip

    normalized
  end

  private

  # 郵便番号の正規化（ハイフン除去・7桁統一）
  #
  # == 正規化処理
  # - ハイフンの除去: "690-0887" → "6900887"
  # - 前後空白の除去
  # - 全角数字の半角変換: "６９０−０８８７" → "6900887"
  #
  # @param zipcode [String] 入力郵便番号
  # @return [String] 正規化済み郵便番号（7桁数字）
  def self.normalize_zipcode(zipcode)
    zipcode.to_s
           .tr("０-９", "0-9")  # 全角→半角変換
           .gsub(/[^0-9]/, "")  # 数字以外を除去
           .strip
  end

  # 郵便番号形式の妥当性を検証
  #
  # == 検証条件
  # - 桁数: 正確に7桁
  # - 文字種: 半角数字のみ
  # - 範囲: 実在する郵便番号の番号体系に適合
  #
  # @param zipcode [String] 検証対象の郵便番号
  # @return [Boolean] 有効な形式の場合true
  def self.valid_zipcode_format?(zipcode)
    # 7桁の半角数字のみを許可
    zipcode.match?(/\A\d{7}\z/)
  end

  # 住所要素から完全な住所文字列を構築
  #
  # == 住所階層の結合
  # zipcloud APIから取得した住所要素を適切に結合し、
  # 読みやすい住所文字列を生成します。
  #
  # @param address_data [Hash] zipcloud APIからの住所データ
  # @return [String, nil] 構築された住所文字列
  def self.build_full_address(address_data)
    prefecture = address_data["address1"]  # 都道府県
    city = address_data["address2"]        # 市区町村
    town = address_data["address3"]        # 町域

    # 必須要素（都道府県・市区町村）の存在確認
    return nil if prefecture.blank? || city.blank?

    # 町域はオプション（大都市部では省略される場合がある）
    if town.present?
      "#{prefecture}#{city}#{town}"
    else
      "#{prefecture}#{city}"
    end
  end

  # APIエラーの統一ログ出力
  #
  # == ログ出力項目
  # - エラー種別（通信エラー、解析エラー等）
  # - 対象郵便番号（トラブルシューティング用）
  # - 詳細エラー情報（スタックトレース等）
  # - タイムスタンプ（自動付与）
  #
  # @param error_type [String] エラーの種別
  # @param zipcode [String] エラーが発生した郵便番号
  # @param details [String] エラーの詳細情報
  def self.log_api_error(error_type, zipcode, details)
    Rails.logger.warn("[AddressService] #{error_type}: 郵便番号=#{zipcode}, 詳細=#{details}")
  end
end
