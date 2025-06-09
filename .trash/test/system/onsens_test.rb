# frozen_string_literal: true
require "application_system_test_case"

class OnsensTest < ApplicationSystemTestCase
  setup do
    @onsen = onsens(:one)
  end

  test "温泉一覧と詳細が表示できる" do
    visit onsens_url
    assert_selector "h1", text: "温泉"
    click_on @onsen.name
    assert_selector "h1", text: @onsen.name
  end

  test "レビュー投稿ができる" do
    visit onsen_url(@onsen)
    fill_in "評価", with: 4
    fill_in "コメント", with: "テストレビュー"
    click_on "投稿"
    assert_text "テストレビュー"
    assert_selector ".text-yellow-400"
  end
end
