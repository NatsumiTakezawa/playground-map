# CSVインポート専用コントローラ
#
# 管理画面での温泉データCSVインポート機能を提供するコントローラです。
# 責務を明確にするため、Admin::OnsensControllerから分離しました。
#
# @note 初学者向け解説
#   - Single Responsibility Principle（単一責任原則）を適用
#   - CSVインポート処理のみに特化することで理解しやすく設計
#   - CsvImportService にビジネスロジックを委譲
#   - エラーハンドリングを明確に分離
#
# @example 利用可能なルート
#   GET  /admin/csv_imports/new     # CSVインポートフォーム表示
#   POST /admin/csv_imports         # CSVファイル処理実行
#
# @see CsvImportService CSVファイル処理サービス
# @see Admin::OnsensController メインの温泉管理機能
# @author 松江市温泉マップ開発チーム
# @since Rails 8.0.2
class Admin::CsvImportsController < ApplicationController
  # CSVインポートフォーム表示
  #
  # CSVファイルアップロード用のフォームを表示します。
  # シンプルな画面で、ファイル選択とアップロード機能のみを提供します。
  #
  # @note アクション詳細
  #   - GET /admin/csv_imports/new でアクセス
  #   - ファイル選択フォームとインポート説明を表示
  #   - フォーム送信時は create アクションで処理
  #
  # @note 初学者向け解説
  #   - 特別な処理は不要（単純なフォーム表示）
  #   - CSVファイル形式の説明をビューで表示
  #   - multipart/form-data でファイルアップロード対応
  #
  # @return [void] new.html.erbを表示
  def new
    # CSVインポートフォームを表示（特別な処理は不要）
  end

  # CSVファイルインポート処理
  #
  # アップロードされたCSVファイルから温泉データを一括登録します。
  # CsvImportServiceを使用してバリデーションとエラーハンドリングを行います。
  #
  # @note アクション詳細
  #   - POST /admin/csv_imports でアクセス
  #   - multipart/form-data でファイルを受け取り
  #   - CsvImportService でファイル処理を委譲
  #   - 結果に応じて適切なフラッシュメッセージを表示
  #
  # @note 初学者向け解説
  #   - params[:file] でアップロードファイルを取得
  #   - Service Object パターンでビジネスロジックを分離
  #   - flash メッセージでユーザーにフィードバック提供
  #   - 処理後は温泉管理画面にリダイレクト
  #
  # @param file [ActionDispatch::Http::UploadedFile] アップロードされたCSVファイル
  # @return [void] 処理結果をフラッシュメッセージで表示後、温泉一覧にリダイレクト
  #
  # @example CSVファイル形式例
  #   name,geo_lat,geo_lng,description,tags
  #   玉造温泉,35.4167,133.0167,美肌の湯として有名,美肌,露天風呂
  #   松江しんじ湖温泉,35.4700,133.0478,宍道湖畔の温泉,湖景,リゾート
  #
  # @see CsvImportService CSVファイル処理サービス
  def create
    if file_present?
      process_csv_import
    else
      handle_no_file_selected
    end
  end

  private

  # CSVファイルの存在確認
  #
  # アップロードされたファイルが存在するかチェックします。
  #
  # @note 初学者向け解説
  #   - params[:file] の存在確認
  #   - present? メソッドで nil, 空文字, 空白文字列をまとめてチェック
  #   - 早期リターンパターンでコードの可読性を向上
  #
  # @return [Boolean] ファイルが存在する場合 true
  def file_present?
    params[:file].present?
  end

  # CSVインポート処理の実行
  #
  # CsvImportServiceを使用してファイルを処理し、結果に応じてメッセージを設定します。
  #
  # @note 初学者向け解説
  #   - Service Object パターンで複雑な処理を委譲
  #   - 処理結果に応じた条件分岐でユーザーフレンドリーなメッセージ表示
  #   - flash.now ではなく flash を使用（リダイレクト後に表示）
  #
  # @return [void] 温泉一覧画面にリダイレクト
  def process_csv_import
    import_result = CsvImportService.call(params[:file])
    set_import_message(import_result)
    redirect_to admin_onsens_path
  end

  # インポート結果に応じたメッセージ設定
  #
  # CsvImportServiceの処理結果を分析し、適切なフラッシュメッセージを設定します。
  #
  # @note 初学者向け解説
  #   - 複雑な条件分岐を専用メソッドに分離
  #   - エラー、部分成功、完全成功の3パターンでメッセージを分岐
  #   - I18n対応のメッセージキーを使用（将来の多言語化対応）
  #
  # @param import_result [Hash] インポート処理結果
  #   - :error [String] エラーメッセージ（エラー時のみ）
  #   - :skipped [Integer] スキップされた行数
  #   - :imported [Integer] 正常にインポートされた行数
  # @return [void] flashメッセージを設定
  def set_import_message(import_result)
    if import_result[:error]
      # 致命的エラーが発生した場合
      flash[:alert] = "CSVインポート失敗: #{import_result[:error]}"
    elsif import_result[:skipped] > 0
      # 一部の行がスキップされた場合
      imported = import_result[:imported] || 0
      skipped = import_result[:skipped]
      flash[:notice] = "インポート完了: #{imported}件登録、#{skipped}件スキップ"
    else
      # 全ての行が正常に処理された場合
      imported = import_result[:imported] || 0
      flash[:notice] = "CSVインポート完了: #{imported}件の温泉を登録しました"
    end
  end

  # ファイル未選択時の処理
  #
  # CSVファイルが選択されていない場合のエラーハンドリングを行います。
  #
  # @note 初学者向け解説
  #   - バリデーションエラーの適切な処理方法
  #   - ユーザーフレンドリーなエラーメッセージ
  #   - 温泉一覧画面へのリダイレクトで操作の継続性を確保
  #
  # @return [void] エラーメッセージ表示後、温泉一覧にリダイレクト
  def handle_no_file_selected
    flash[:alert] = t("admin.csv_imports.errors.no_file_selected", default: "CSVファイルを選択してください")
    redirect_to admin_onsens_path
  end
end
