require_relative "boot"

require "rails/all"

# Tailwind CSS Rails gem を明示的に require する
require "tailwindcss-rails"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module MatsueOnsenMapTemp
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.1

    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`.
    config.autoload_lib(ignore: %w(assets tasks))

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    # config.time_zone = "Central Time (US & Canada)"
    # config.eager_load_paths << Rails.root.join("extras")

    config.after_initialize do
      # Tailwind CSS の設定
      config.tailwindcss.tap do |tailwind_config|
        tailwind_config.input_path = Rails.root.join("app/assets/stylesheets/application.tailwind.css")
        # 必要に応じて、設定ファイルのパスや出力パスも明示的に指定できます。
        # tailwind_config.config_file_path = Rails.root.join("config/tailwind.config.js")
        # tailwind_config.output_path = Rails.root.join("app/assets/builds/tailwind.css")
      end
    end
  end
end
