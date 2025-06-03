
# 管理画面用温泉コントローラ
#
# 温泉データの管理機能（CRUD操作）を提供するコントローラです。
# 認証・認可は設けず、誰でも管理操作が可能な学習用仕様となっています。
#
# @note 初学者向け解説
#   - Admin名前空間を使用してルートを整理
#   - RESTful設計に完全準拠（7つの標準アクション + カスタムアクション）
#   - before_action で共通処理を効率化
#   - Strong Parametersでセキュリティを確保
#   - CSVインポート機能でデータ一括登録に対応
#
# @example 利用可能なルート
#   GET    /admin/onsens           # 温泉一覧（index）
#   GET    /admin/onsens/:id       # 温泉詳細（show）
#   GET    /admin/onsens/new       # 新規作成フォーム（new）
#   POST   /admin/onsens           # 温泉作成（create）
#   GET    /admin/onsens/:id/edit  # 編集フォーム（edit）
#   PATCH  /admin/onsens/:id       # 温泉更新（update）
#   DELETE /admin/onsens/:id       # 温泉削除（destroy）
#   POST   /admin/onsens/import    # CSVインポート（カスタムアクション）
#
# @see rails/docs/rails_specification.md
# @see CsvImportService CSVファイル処理サービス
# @author 松江市温泉マップ開発チーム
# @since Rails 8.0.2
class Admin::OnsensController < ApplicationController
  # リクエスト前の共通処理
  #
  # 個別の温泉を操作するアクション実行前に、対象温泉を取得します。
  #
  # @note 初学者向け解説
  #   - only: で特定のアクションのみに適用
  #   - show, edit, update, destroy は個別の温泉が必要
  #   - index, new, create は全体操作なので対象外
  before_action :set_onsen, only: %i[show edit update destroy]

  # 温泉一覧表示
  #
  # 管理画面での温泉一覧を表示します。
  # 全温泉を新しい順で表示し、基本的な管理操作へのリンクを提供します。
  #
  # @note アクション詳細
  #   - GET /admin/onsens でアクセス
  #   - 認証不要（学習用仕様）
  #   - 新規作成、編集、削除、CSVインポートへのリンクを表示
  #
  # @note 初学者向け解説
  #   - Onsen.all でテーブル全体を取得
  #   - order(created_at: :desc) で新しい順にソート
  #   - インスタンス変数 @onsens をビューで使用
  #
  # @return [void] インスタンス変数を設定してindex.html.erbを表示
  #
  # @example ビューでの使用例
  #   <% @onsens.each do |onsen| %>
  #     <%= link_to onsen.name, admin_onsen_path(onsen) %>
  #   <% end %>
  def index
    # 全温泉を新しい順で取得
    @onsens = Onsen.all.order(created_at: :desc)
  end

  # 温泉詳細表示
  #
  # 管理画面での温泉詳細情報を表示します。
  # 温泉の全データとレビュー一覧を確認できます。
  #
  # @note アクション詳細
  #   - GET /admin/onsens/:id でアクセス
  #   - set_onsen で @onsen が設定済み
  #   - 編集・削除へのリンクも表示
  #
  # @note 初学者向け解説
  #   - before_action で @onsen が既に設定されている
  #   - ビューで温泉の詳細情報とレビューを表示
  #   - 管理者向けの詳細情報（作成日時、更新日時など）も表示
  #
  # @param id [Integer] 温泉ID（URLパスパラメータ）
  # @return [void] show.html.erbを表示
  # @raise [ActiveRecord::RecordNotFound] 指定されたIDの温泉が存在しない場合
  def show
    # @onsen は before_action :set_onsen で設定済み
  end

  # 新規温泉作成フォーム表示
  #
  # 新しい温泉を登録するためのフォームを表示します。
  #
  # @note アクション詳細
  #   - GET /admin/onsens/new でアクセス
  #   - 空の温泉オブジェクトを作成してフォームに渡す
  #   - フォーム送信時は create アクションで処理
  #
  # @note 初学者向け解説
  #   - Onsen.new で新規オブジェクトを作成
  #   - バリデーションエラーはまだ発生しない（保存前のため）
  #   - form_with helper でフォームを生成
  #
  # @return [void] インスタンス変数を設定してnew.html.erbを表示
  #
  # @example フォーム例
  #   <%= form_with model: [:admin, @onsen] do |form| %>
  #     <%= form.text_field :name %>
  #   <% end %>
  def new
    # 新規温泉オブジェクトを作成（まだデータベースには保存されない）
    @onsen = Onsen.new
  end

  # 温泉編集フォーム表示
  #
  # 既存の温泉情報を編集するためのフォームを表示します。
  #
  # @note アクション詳細
  #   - GET /admin/onsens/:id/edit でアクセス
  #   - set_onsen で既存の温泉データが @onsen に設定済み
  #   - フォーム送信時は update アクションで処理
  #
  # @note 初学者向け解説
  #   - @onsen には既存のデータが入っている
  #   - フォームには現在の値が自動的に表示される
  #   - Rails の規約により、PATCHメソッドで送信される
  #
  # @param id [Integer] 温泉ID（URLパスパラメータ）
  # @return [void] edit.html.erbを表示
  # @raise [ActiveRecord::RecordNotFound] 指定されたIDの温泉が存在しない場合
  def edit
    # @onsen は before_action :set_onsen で設定済み
  end

  # 温泉新規作成処理
  #
  # 新規温泉フォームから送信されたデータを処理し、データベースに保存します。
  #
  # @note アクション詳細
  #   - POST /admin/onsens でアクセス
  #   - Strong Parameters でセキュリティを確保
  #   - 成功時: 詳細画面にリダイレクト
  #   - 失敗時: 新規作成フォームを再表示（エラーメッセージ付き）
  #
  # @note 初学者向け解説
  #   - onsen_params でStrong Parametersを使用
  #   - @onsen.save でバリデーション実行と保存を同時に行う
  #   - 成功時は redirect_to、失敗時は render で処理を分岐
  #   - render :new でフォームを再表示（データは保持される）
  #
  # @param onsen [Hash] 温泉データ（name, geo_lat, geo_lng, description, tags, images）
  # @return [void] 成功時はリダイレクト、失敗時はフォーム再表示
  #
  # @example 投稿データ例
  #   { onsen: { name: "玉造温泉", geo_lat: 35.4167, geo_lng: 133.0167, ... } }
  #
  # @see onsen_params Strong Parametersメソッド
  def create
    # Strong Parameters で安全なパラメータのみを受け取り、新規オブジェクトを作成
    @onsen = Onsen.new(onsen_params)

    # バリデーションを実行してデータベースに保存
    if @onsen.save
      # 保存成功時: 詳細画面にリダイレクト（成功メッセージ付き）
      redirect_to admin_onsen_path(@onsen), notice: t('admin.onsens.create.success')
    else
      # 保存失敗時: フォームを再表示（バリデーションエラー表示）
      # status: :unprocessable_entity でHTTPステータス422を返す
      render :new, status: :unprocessable_entity
    end
  end

  # 温泉更新処理
  #
  # 編集フォームから送信されたデータを処理し、既存の温泉情報を更新します。
  # 画像の削除機能も同時に提供します。
  #
  # @note アクション詳細
  #   - PATCH/PUT /admin/onsens/:id でアクセス
  #   - 画像削除処理を先に実行（remove_image_ids パラメータ）
  #   - Strong Parameters で更新データを受け取り
  #   - 成功時: 詳細画面にリダイレクト
  #   - 失敗時: 編集フォームを再表示（エラーメッセージ付き）
  #
  # @note 初学者向け解説
  #   - params[:onsen][:remove_image_ids] で削除する画像IDを取得
  #   - image&.purge で安全な画像削除（&演算子でnilチェック）
  #   - update メソッドでバリデーション実行と更新を同時に行う
  #   - 画像削除とデータ更新を別々に処理することで柔軟性を確保
  #
  # @param id [Integer] 温泉ID（URLパスパラメータ）
  # @param onsen [Hash] 更新データ（name, geo_lat, geo_lng, description, tags, images）
  # @param remove_image_ids [Array<String>] 削除する画像IDの配列（任意）
  # @return [void] 成功時はリダイレクト、失敗時はフォーム再表示
  # @raise [ActiveRecord::RecordNotFound] 指定されたIDの温泉が存在しない場合
  #
  # @example 削除する画像がある場合のパラメータ
  #   { onsen: { name: "新しい名前", remove_image_ids: ["1", "3"] } }
  def update
    # 画像削除処理（更新前に実行）
    if params[:onsen][:remove_image_ids].present?
      params[:onsen][:remove_image_ids].each do |img_id|
        # 指定されたIDの画像を安全に取得・削除
        image = @onsen.images.find_by(id: img_id)
        image&.purge  # &演算子でnilチェック付き削除
      end
    end

    # 温泉データの更新処理
    if @onsen.update(onsen_params)
      # 更新成功時: 詳細画面にリダイレクト（成功メッセージ付き）
      redirect_to admin_onsen_path(@onsen), notice: t('admin.onsens.update.success')
    else
      # 更新失敗時: 編集フォームを再表示（バリデーションエラー表示）
      render :edit, status: :unprocessable_entity
    end
  end

  # 温泉削除処理
  #
  # 指定された温泉をデータベースから削除します。
  # 関連するレビューや画像も同時に削除されます（dependent: :destroy）。
  #
  # @note アクション詳細
  #   - DELETE /admin/onsens/:id でアクセス
  #   - 削除後は一覧画面にリダイレクト
  #   - destroy! を使用して例外発生時のエラーハンドリングを強化
  #
  # @note 初学者向け解説
  #   - @onsen.destroy! で完全削除を実行（!付きで例外を発生）
  #   - dependent: :destroy でレビューや画像も自動削除
  #   - status: :see_other でHTTPステータス303を返す（推奨）
  #   - 削除後のリダイレクト先は一覧画面
  #
  # @param id [Integer] 温泉ID（URLパスパラメータ）
  # @return [void] 一覧画面にリダイレクト
  # @raise [ActiveRecord::RecordNotFound] 指定されたIDの温泉が存在しない場合
  # @raise [ActiveRecord::RecordNotDestroyed] 削除に失敗した場合
  #
  # @example 削除実行例
  #   DELETE /admin/onsens/1  # ID=1の温泉を削除
  def destroy
    # 温泉と関連データを完全削除
    @onsen.destroy!

    # 一覧画面にリダイレクト（成功メッセージ付き）
    redirect_to admin_onsens_path, status: :see_other, notice: t('admin.onsens.destroy.success')
  end

  # CSVファイルインポート処理
  #
  # アップロードされたCSVファイルから温泉データを一括登録します。
  # CsvImportServiceを使用してバリデーションとエラーハンドリングを行います。
  #
  # @note アクション詳細
  #   - POST /admin/onsens/import でアクセス
  #   - multipart/form-data でファイルを受け取り
  #   - CsvImportService でファイル処理を委譲
  #   - 結果に応じて適切なフラッシュメッセージを表示
  #
  # @note 初学者向け解説
  #   - params[:file] でアップロードファイルを取得
  #   - Service Object パターンでビジネスロジックを分離
  #   - @import_result でインポート結果を取得
  #   - flash.now でページ遷移なしのメッセージ表示
  #
  # @param file [ActionDispatch::Http::UploadedFile] アップロードされたCSVファイル
  # @return [void] インポート画面を再表示（結果メッセージ付き）
  #
  # @example CSVファイル形式例
  #   name,geo_lat,geo_lng,description,tags
  #   玉造温泉,35.4167,133.0167,美肌の湯として有名,美肌,露天風呂
  #
  # @see CsvImportService CSVファイル処理サービス
  def import
    # ファイルがアップロードされているかチェック
    if params[:file].present?
      # CsvImportService でファイルを処理
      @import_result = CsvImportService.call(params[:file])
      skipped = @import_result[:skipped]

      # インポート結果に応じてフラッシュメッセージを設定
      if @import_result[:error]
        # 致命的エラーが発生した場合
        flash.now[:alert] = "CSVインポート失敗: #{@import_result[:error]}"
      elsif skipped > 0
        # 一部の行がスキップされた場合
        flash.now[:notice] = "インポート完了（#{skipped}行スキップ）"
      else
        # 全ての行が正常に処理された場合
        flash.now[:notice] = 'インポート完了'
      end

      # インポート画面を再表示（結果表示）
      render :import
    else
      # ファイルが選択されていない場合
      flash[:alert] = 'CSVファイルを選択してください'
      redirect_to admin_onsens_path
    end
  end

  private

  # 温泉オブジェクトの取得
  #
  # URLパラメータから温泉IDを取得し、対応する温泉オブジェクトを設定します。
  # before_actionで指定されたアクション実行前に呼び出されます。
  #
  # @note 初学者向け解説
  #   - params[:id] でURLパスパラメータを取得
  #   - Onsen.find() は見つからない場合に404エラーを自動発生
  #   - @onsen インスタンス変数で各アクションからアクセス可能
  #   - DRY原則に従って重複コードを削減
  #
  # @return [void] @onsen インスタンス変数を設定
  # @raise [ActiveRecord::RecordNotFound] 指定されたIDの温泉が存在しない場合
  def set_onsen
    @onsen = Onsen.find(params[:id])
  end

  # Strong Parameters設定
  #
  # セキュリティ対策として、許可されたパラメータのみを受け取ります。
  # Mass Assignment攻撃を防ぎ、意図しないデータの変更を防止します。
  #
  # @note 初学者向け解説
  #   - params.require(:onsen) でonsenキーの存在を必須とする
  #   - permit() で許可する属性を明示的に指定
  #   - images: [] で配列形式の画像ファイルを許可
  #   - 許可されていない属性は自動的に除外される
  #
  # @return [ActionController::Parameters] 許可されたパラメータのみ
  #
  # @example 許可されるパラメータ
  #   { name: "玉造温泉", geo_lat: 35.4167, geo_lng: 133.0167,
  #     description: "美肌の湯", tags: "美肌,露天風呂",
  #     images: [file1, file2] }
  #
  # @see https://railsguides.jp/action_controller_overview.html#strong-parameters
  def onsen_params
    params.require(:onsen).permit(:name, :geo_lat, :geo_lng, :description, :tags, images: [])
  end
end
