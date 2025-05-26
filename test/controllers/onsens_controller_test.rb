# frozen_string_literal: true
require "test_helper"

class OnsensControllerTest < ActionDispatch::IntegrationTest
  fixtures :onsens

  setup do
    @onsen = onsens(:one)
  end

  test "一覧ページが表示される" do
    get onsens_url
    assert_response :success
    assert_select "h1", /温泉/
    assert_select "body", /松江しんじ湖温泉/
  end

  test "詳細ページが表示される" do
    get onsen_url(@onsen)
    assert_response :success
    assert_select "h1", @onsen.name
  end

  test "検索クエリで絞り込みできる" do
    get onsens_url, params: { q: @onsen.name }
    assert_response :success
    assert_select "h1", /温泉/
    assert_select "body", /#{@onsen.name}/
  end
end
