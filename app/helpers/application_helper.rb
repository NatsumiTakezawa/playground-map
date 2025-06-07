module ApplicationHelper
  # @return [Array<Hash>] ナビゲーションリンクの配列を返す
  def navigation_links
    if current_path.start_with?("/admin")
      admin_navigation_links
    else
      public_navigation_links
    end
  end

  # @param icon_svg_path [String] SVGのpathデータ
  # @param position [Symbol] アイコンの位置 (:left または :right)
  # @param loading [Boolean] ローディング状態
  # @return [String] アイコン要素のHTML
  def render_button_icon(icon_svg_path, position, loading: false)
    return "" if icon_svg_path.blank? || loading

    css_classes = case position
    when :left
                    "-ml-1 mr-2 h-4 w-4"
    when :right
                    "ml-2 -mr-1 h-4 w-4"
    else
                    "h-4 w-4"
    end

    content_tag(:svg, class: css_classes, xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", "stroke-width": "2") do
      content_tag(:path, "", "stroke-linecap": "round", "stroke-linejoin": "round", d: icon_svg_path)
    end
  end

  # @param type [String] アラートタイプ ('error', 'success', 'warning', 'info')
  # @return [Hash] アラートメッセージのスタイル情報
  def alert_style_config(type)
    # 共通設定のベース
    base_config = {
      role: "alert",
      aria_live: "polite"
    }

    # タイプ固有設定
    type_configs = {
      "error" => {
        color: "red",
        icon_path: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z",
        default_title: "エラー"
      },
      "success" => {
        color: "green",
        icon_path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        role: "status",
        default_title: "成功"
      },
      "warning" => {
        color: "yellow",
        icon_path: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 16.5c-.77.833.192 2.5 1.732 2.5z",
        default_title: "警告"
      },
      "info" => {
        color: "blue",
        icon_path: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
        role: "status",
        default_title: "情報"
      }
    }

    config = type_configs[type.to_s] || type_configs["info"]
    color = config[:color]

    # 色ベースのクラス生成
    base_config.merge({
      base_classes: "bg-#{color}-50 border border-#{color}-200",
      icon_classes: "text-#{color}-400",
      title_classes: "text-#{color}-800 font-semibold",
      message_classes: "text-#{color}-700",
      button_classes: "text-#{color}-400 hover:text-#{color}-600",
      icon_path: config[:icon_path],
      role: config[:role] || base_config[:role],
      aria_live: base_config[:aria_live],
      default_title: config[:default_title]
    })
  end

  private

  # @return [Array<Hash>] 公開サイト用ナビゲーションリンク
  def public_navigation_links
    create_navigation_link_set([
      { path: "/", label: t("views.navigation.search"), aria_label: "検索・地図", current_check: -> { current_path == "/" } },
      { path: "/admin/onsens", label: t("views.navigation.admin"), aria_label: "管理画面", current_check: -> { false } }
    ])
  end

  # @return [Array<Hash>] 管理サイト用ナビゲーションリンク
  def admin_navigation_links
    create_navigation_link_set([
      { path: "/admin/onsens", label: t("views.navigation.onsen_management"), aria_label: "温泉管理", current_check: -> { current_path.start_with?("/admin/onsens") } },
      { path: "/", label: t("views.navigation.public_site"), aria_label: "公開サイト", current_check: -> { false } }
    ])
  end

  # ナビゲーションリンクセットを生成する共通メソッド
  # @param link_configs [Array<Hash>] リンク設定の配列
  # @return [Array<Hash>] ナビゲーションリンクの配列
  def create_navigation_link_set(link_configs)
    link_configs.map do |config|
      {
        path: config[:path],
        label: config[:label],
        aria_label: config[:aria_label],
        current: config[:current_check].call
      }
    end
  end
end
