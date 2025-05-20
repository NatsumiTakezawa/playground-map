source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.3.8"

gem "rails", "~> 8.0.2"

# Use the Puma web server
gem "puma" # バージョン指定を削除し、Rails 8 の依存に任せる

# Hotwire JavaScript stack
gem "turbo-rails" # バージョン指定を削除し、Rails 8 の依存に任せる
gem "stimulus-rails" # バージョン指定を削除し、Rails 8 の依存に任せる

# Tailwind CSS
gem "tailwindcss-rails"

# Use PostgreSQL as the database for Active Record
gem "pg" # バージョン指定を削除し、Rails 8 の依存に任せる

# Asset Pipeline
gem "propshaft" # バージョン指定を削除し、Rails 8 の依存に任せる

# Build JSON APIs with Jbuilder
gem "jbuilder" # バージョン指定を削除し、Rails 8 の依存に任せる (必要であれば)

# Reduces boot times through caching.
gem "bootsnap", require: false

# Windows環境向けのgemはコメントアウトまたは削除
# gem "wdm", "~> 0.1.0"

# Debugging and Performance
group :development, :test do
  gem "debug", "~> 1.9"
  # gem "sqlite3" # PostgreSQL を使用するためコメントアウトまたは削除
end

group :development do
  gem "web-console"
end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
  gem "webdrivers"
end

# Sidekiq for background jobs
gem "sidekiq"
gem "redis", ">= 4.0.1" # Sidekiq との互換性を考慮したバージョン

# TZInfo data source
gem "tzinfo-data", platforms: %i[mingw mswin x64_mingw jruby]
