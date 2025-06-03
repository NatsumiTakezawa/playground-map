
# @!parse
#   # 温泉情報を管理するモデルクラス
#   #
#   # == 初学者向け解説
#   # このクラスはActiveRecordパターンに基づいて設計されています。
#   # - データベースのテーブル構造とRubyオブジェクトの間をマッピング
#   # - ビジネスロジック（検索、平均評価計算等）をカプセル化
#   # - 他のモデル（Review）との関連性を定義
#   #
#   # == 設計思想
#   # 1. 単一責任の原則: 温泉データの管理に特化
#   # 2. 開放閉鎖の原則: 検索機能は拡張しやすく設計
#   # 3. データ整合性: バリデーションによるデータ品質保証
#   #
#   # == 主要機能
#   # - 温泉データのCRUD操作
#   # - 複合条件による高度な検索機能
#   # - レビューとの関連管理
#   # - 画像ファイルの添付機能
#   #
#   # @see ApplicationRecord 基底クラスの共通機能
#   # @see Review 関連するレビューモデル
#   # @since 1.0.0
#   class Onsen < ApplicationRecord

# 温泉情報モデル - 松江市温泉マップの中核データエンティティ
#
# == 概要
# このクラスは温泉施設の情報を管理するActiveRecordモデルです。
# 地理情報（緯度・経度）、基本情報（名前・説明）、メタデータ（タグ）を
# 統合的に管理し、複雑な検索機能を提供します。
#
# == データベース設計
# PostgreSQLのデータベーステーブル 'onsens' に対応しています。
# 位置情報はdecimal型で高精度な座標を保存し、地理計算に対応します。
#
# == Active Storage 連携
# has_many_attached :imagesにより、複数画像の添付が可能です。
# 画像はJPEG/PNG/GIF形式、1枚あたり5MB以下、最大5枚まで対応。
#
# @see ApplicationRecord 共通の基底クラス
# @see Review 1対多の関連モデル（温泉:レビュー）
# @see MapService 地理計算サービス
# @since 1.0.0
# @author 松江市温泉マップ開発チーム
class Onsen < ApplicationRecord
  #
  # == データベース属性定義
  # Rails の属性アクセサが自動生成される各カラム
  #

  # @!attribute [rw] name
  #   温泉施設の名称
  #   @return [String] 温泉名（必須・100文字以内）
  #   @note プライマリーな検索対象フィールド
  #   @example "玉造温泉 清風荘"

  # @!attribute [rw] geo_lat
  #   施設の緯度座標（北緯）
  #   @return [BigDecimal] 緯度（必須・小数6桁精度）
  #   @note GPS座標系（WGS84）に準拠
  #   @example 35.123456

  # @!attribute [rw] geo_lng
  #   施設の経度座標（東経）
  #   @return [BigDecimal] 経度（必須・小数6桁精度）
  #   @note GPS座標系（WGS84）に準拠
  #   @example 132.987654

  # @!attribute [rw] description
  #   温泉施設の詳細説明・特徴
  #   @return [String, nil] 説明文（任意・1000文字以内）
  #   @note HTMLタグは使用不可、プレーンテキストのみ
  #   @example "歴史ある温泉で、美肌効果で有名です。露天風呂からの景色が絶景。"

  # @!attribute [rw] tags
  #   検索・分類用のタグ情報
  #   @return [String, nil] タグ（任意・カンマ区切り・255文字以内）
  #   @note フィルタリング検索で使用
  #   @example "露天風呂,美肌,歴史,景色"

  #
  # == アソシエーション（関連）
  # Rails の関連機能により、他のモデルとの関係を定義
  #

  # 温泉に対するレビュー（評価・口コミ）の1対多関係
  # @return [ActiveRecord::Associations::CollectionProxy<Review>] 関連するレビュー群
  # @note dependent: :destroy により、温泉削除時に関連レビューも削除
  # @see Review レビューモデルの詳細
  has_many :reviews, dependent: :destroy

  # Active Storage による画像添付機能
  # @return [ActiveStorage::Attached::Many] 添付画像コレクション
  # @note 温泉施設の外観・内観・設備等の写真を管理
  # @see 画像バリデーション（content_type, size, limit）
  has_many_attached :images

  #
  # == バリデーション（データ検証）
  # データベース保存前にデータ整合性を検証
  #

  # 温泉名の検証ルール
  # @note 必須入力かつ100文字以内の制限
  validates :name, presence: true, length: { maximum: 100 }

  # 緯度の検証ルール
  # @note 必須入力かつ数値形式（-90〜90の範囲は地理的制約で保証）
  validates :geo_lat, presence: true, numericality: true

  # 経度の検証ルール
  # @note 必須入力かつ数値形式（-180〜180の範囲は地理的制約で保証）
  validates :geo_lng, presence: true, numericality: true

  # 説明文の検証ルール
  # @note 任意入力、ただし入力時は1000文字以内
  validates :description, length: { maximum: 1000 }, allow_blank: true

  # タグの検証ルール
  # @note 任意入力、ただし入力時は255文字以内
  validates :tags, length: { maximum: 255 }, allow_blank: true

  # 添付画像の検証ルール
  # @note ファイル形式・サイズ・枚数の制限を複合的に適用
  validates :images,
    content_type: ["image/jpeg", "image/png", "image/gif"], # 許可ファイル形式
    size: { less_than: 5.megabytes },                       # 1枚あたり5MB未満
    limit: { max: 5 }                                        # 最大5枚まで

  #
  # == クラスメソッド（検索機能）
  #

  # 多条件対応の高度な温泉検索機能
  #
  # == 機能概要
  # テキスト検索、タグフィルタ、位置情報検索を組み合わせた
  # 複合検索を提供します。各条件は独立して動作し、
  # 指定された条件の論理積（AND）で結果を絞り込みます。
  #
  # == 検索アルゴリズム
  # 1. 基本スコープ（全件）から開始
  # 2. テキスト検索：名前・説明文の部分一致（大文字小文字区別なし）
  # 3. タグ検索：カンマ区切りタグのOR条件マッチング
  # 4. 位置検索：二段階フィルタ（粗い矩形→厳密な距離計算）
  #
  # == パフォーマンス最適化
  # 位置情報検索では、先にデータベースレベルで矩形範囲に絞り込み、
  # その後Rubyで厳密な球面距離計算を行う二段階方式を採用。
  # 大量データでも効率的な検索を実現しています。
  #
  # @param params [ActionController::Parameters, Hash] 検索条件パラメータ
  # @option params [String] :q テキスト検索クエリ（名前・説明文対象）
  # @option params [String] :tags カンマ区切りタグリスト
  # @option params [String, Numeric] :lat 検索基準点の緯度
  # @option params [String, Numeric] :lng 検索基準点の経度
  # @option params [String, Numeric] :radius_km 検索半径（km、1-50kmに制限）
  #
  # @return [ActiveRecord::Relation, Array<Onsen>] 検索結果
  # @note 位置検索時はActiveRecord::Relationではなく配列を返す
  #
  # @example 基本的なテキスト検索
  #   Onsen.search(q: "玉造")
  #   # => 名前または説明に「玉造」を含む温泉を検索
  #
  # @example タグ検索
  #   Onsen.search(tags: "露天風呂,美肌")
  #   # => 「露天風呂」または「美肌」タグを持つ温泉を検索
  #
  # @example 位置情報検索
  #   Onsen.search(lat: 35.1234, lng: 132.5678, radius_km: 10)
  #   # => 指定座標から半径10km以内の温泉を検索
  #
  # @example 複合検索
  #   Onsen.search(q: "温泉", tags: "露天風呂", lat: 35.1234, lng: 132.5678, radius_km: 5)
  #   # => すべての条件を満たす温泉を検索
  #
  # @see MapService.distance_km 球面距離計算の詳細
  # @see PostgreSQL ILIKE演算子（大文字小文字を区別しない部分一致）
  def self.search(params)
    # 基本スコープ（全件）から検索を開始
    scope = all

    # === テキスト検索処理 ===
    # 名前（name）と説明（description）フィールドを対象とした部分一致検索
    if params[:q].present?
      q = params[:q].strip  # 前後の空白文字を除去
      # PostgreSQLのILIKE演算子を使用（大文字小文字を区別しない部分一致）
      scope = scope.where("name ILIKE :q OR description ILIKE :q", q: "%#{q}%")
    end

    # === タグ検索処理 ===
    # カンマ区切りの複数タグに対するOR条件検索
    if params[:tags].present?
      # タグ文字列を分割し、空白除去・空要素除外を実行
      tags = params[:tags].split(",").map(&:strip).reject(&:blank?)

      if tags.any?
        # 各タグに対するILIKE条件を動的に生成
        tag_query = tags.map { |t| "tags ILIKE ?" }.join(" OR ")
        tag_values = tags.map { |t| "%#{t}%" }
        scope = scope.where(tag_query, *tag_values)
      end
    end

    # === 位置情報検索処理 ===
    # 緯度・経度・半径がすべて指定された場合のみ実行
    if params[:lat].present? && params[:lng].present? && params[:radius_km].present?
      lat = params[:lat].to_f
      lng = params[:lng].to_f
      # 半径は1-50kmの範囲に制限（安全性とパフォーマンスのため）
      radius = [[params[:radius_km].to_f, 1].max, 50].min

      # *** 二段階検索アルゴリズム ***

      # 第一段階：粗い矩形範囲でデータベースレベル絞り込み
      # 緯度1度 ≈ 111km の近似を使用（高速化のため）
      lat_delta = radius / 111.0
      # 経度は緯度により変化するため、cos補正を適用
      lng_delta = radius / (111.0 * Math.cos(lat * Math::PI / 180))

      # データベースクエリで矩形範囲に絞り込み（高速）
      scope = scope.where(
        geo_lat: (lat - lat_delta)..(lat + lat_delta),
        geo_lng: (lng - lng_delta)..(lng + lng_delta)
      )

      # 第二段階：Rubyで厳密な球面距離計算を実行
      # MapServiceの球面三角法による正確な距離計算を使用
      scope = scope.select do |onsen|
        MapService.distance_km(lat, lng, onsen.geo_lat, onsen.geo_lng) <= radius
      end
    end

    scope
  end

  #
  # == インスタンスメソッド（計算機能）
  #

  # 温泉の平均評価値を計算
  #
  # == 計算ロジック
  # 関連するすべてのレビューの評価（rating）の算術平均を求め、
  # 小数点以下を四捨五入して整数値で返します。
  # レビューが1件もない場合は0を返します。
  #
  # == データベース効率化
  # ActiveRecordのaverageメソッドを使用してSQL集約関数で計算。
  # 大量レビューでもメモリ効率的に処理できます。
  #
  # @return [Integer] 平均評価値（1-5の整数、レビューがない場合は0）
  #
  # @example レビューがある場合
  #   onsen = Onsen.find(1)
  #   onsen.reviews.create!(rating: 4)
  #   onsen.reviews.create!(rating: 5)
  #   onsen.average_rating  # => 5 (4.5を四捨五入)
  #
  # @example レビューがない場合
  #   onsen = Onsen.new(name: "新規温泉")
  #   onsen.average_rating  # => 0
  #
  # @see Review#rating 個別レビューの評価値
  # @see ActiveRecord::Calculations#average SQL集約関数
  def average_rating
    # レビューが存在しない場合は即座に0を返す（効率化）
    return 0 if reviews.empty?

    # SQL集約関数 AVG() でデータベースレベル計算
    # &.round でnilセーフな四捨五入、|| 0 でnilガード
    reviews.average(:rating)&.round || 0
  end
end
