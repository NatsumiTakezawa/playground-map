
# @!parse
#   # レビュー（評価・口コミ）情報を管理するモデルクラス
#   #
#   # == 初学者向け解説
#   # このクラスは温泉に対するユーザーレビューを管理します。
#   # - 評価値（1-5段階）と自由記述コメントを保存
#   # - 温泉との多対一関係（belongs_to）を定義
#   # - Active Storageによる画像添付機能を提供
#   #
#   # == 設計思想
#   # 1. シンプル設計: 評価に必要な最小限の情報のみ保持
#   # 2. データ整合性: 評価値の範囲制限、コメント長制限
#   # 3. 拡張性: 将来的な機能追加（評価項目細分化等）に対応
#   #
#   # == 匿名レビューシステム
#   # 認証機能を持たないため、すべてのレビューは匿名投稿です。
#   # これにより参入障壁を下げ、気軽な口コミ投稿を促進します。
#   #
#   # @see ApplicationRecord 基底クラスの共通機能
#   # @see Onsen 関連する温泉モデル
#   # @since 1.0.0
#   class Review < ApplicationRecord

# レビューモデル - 温泉に対する評価・口コミ管理
#
# == 概要
# このクラスは温泉施設に対するユーザーレビュー（評価・コメント）を
# 管理するActiveRecordモデルです。5段階評価システムと自由記述による
# 口コミ機能を提供し、温泉選択の意思決定をサポートします。
#
# == データ構造
# - rating: 1-5の整数による定量評価
# - comment: 最大500文字の自由記述コメント
# - onsen_id: 関連温泉への外部キー
# - 画像: 最大3枚のレビュー写真（Active Storage）
#
# == レビューシステムの特徴
# 1. 匿名投稿: ユーザー登録不要で気軽に投稿可能
# 2. 画像付きレビュー: 施設の実際の様子を視覚的に共有
# 3. 適度な文字制限: 簡潔で読みやすいレビューを促進
#
# @see ApplicationRecord 共通の基底クラス
# @see Onsen 1対多の関連モデル（温泉:レビュー）
# @since 1.0.0
# @author 松江市温泉マップ開発チーム
class Review < ApplicationRecord
  #
  # == データベース属性定義
  # Rails の属性アクセサが自動生成される各カラム
  #

  # @!attribute [rw] rating
  #   5段階評価による定量評価値
  #   @return [Integer] 評価値（必須・1〜5の整数）
  #   @note 1=悪い、2=やや悪い、3=普通、4=良い、5=非常に良い
  #   @example 4

  # @!attribute [rw] comment
  #   レビューの自由記述コメント
  #   @return [String, nil] コメント文（任意・500文字以内）
  #   @note HTMLタグは使用不可、プレーンテキストのみ
  #   @example "お湯がとても気持ちよく、スタッフの対応も親切でした。また利用したいです。"

  # @!attribute [rw] onsen_id
  #   関連する温泉の識別子（外部キー）
  #   @return [Integer] 温泉ID（必須）
  #   @note belongs_to関連により、自動的にOnsenオブジェクトにアクセス可能
  #   @see #onsen 関連温泉オブジェクトへのアクセサ

  #
  # == アソシエーション（関連）
  # Rails の関連機能により、他のモデルとの関係を定義
  #

  # レビューが所属する温泉施設との多対一関係
  # @return [Onsen] 関連する温泉オブジェクト
  # @note 外部キー onsen_id により温泉データと結合
  # @see Onsen 温泉モデルの詳細
  belongs_to :onsen

  # Active Storage による画像添付機能
  # @return [ActiveStorage::Attached::Many] 添付画像コレクション
  # @note レビューの信頼性向上のため、実際の写真添付を推奨
  # @see 画像バリデーション（content_type, size, limit）
  has_many_attached :images

  #
  # == バリデーション（データ検証）
  # データベース保存前にデータ整合性を検証
  #

  # 評価値の検証ルール
  # @note 必須入力かつ1-5の範囲内に限定（5段階評価システム）
  validates :rating, presence: true, inclusion: { in: 1..5 }

  # コメントの検証ルール
  # @note 任意入力、ただし入力時は500文字以内（読みやすさ重視）
  validates :comment, length: { maximum: 500 }, allow_blank: true

  # 添付画像の検証ルール
  # @note ファイル形式・サイズ・枚数の制限を複合的に適用
  validates :images,
    content_type: [ "image/jpeg", "image/png", "image/gif" ], # 許可ファイル形式
    size: { less_than: 3.megabytes },                       # 1枚あたり3MB未満
    limit: { max: 3 }                                        # 最大3枚まで

  #
  # == 設計ノート（初学者向け）
  #

  # === なぜシンプルな構造にしているか ===
  # 1. 学習容易性: 初学者が理解しやすい最小限の要素
  # 2. 開発効率: 複雑な機能追加前のMVP（Minimum Viable Product）
  # 3. データ品質: 項目数を絞ることで入力完了率を向上
  #
  # === 将来的な拡張可能性 ===
  # - 評価項目の細分化（料金、清潔さ、サービス等）
  # - ユーザー認証導入時のuser_id追加
  # - いいね機能、返信機能等のソーシャル要素
  # - 不適切投稿の報告・管理機能
  #
  # === Active Recordパターンの活用 ===
  # - belongs_to関連による参照整合性の保証
  # - バリデーションによるデータ品質管理
  # - Active Storageによるファイル管理の抽象化
  # - 将来的なコールバック（投稿通知等）の実装基盤
end
