require "application_system_test_case"

class Admin::OnsensTest < ApplicationSystemTestCase
  setup do
    @admin_onsen = admin_onsens(:one)
  end

  test "visiting the index" do
    visit admin_onsens_url
    assert_selector "h1", text: "Onsens"
  end

  test "管理画面で温泉の新規作成・編集・削除ができる" do
    visit admin_onsens_url
    click_on "新規登録"
    fill_in "名称", with: "新しい温泉"
    fill_in "緯度", with: 35.5
    fill_in "経度", with: 133.1
    click_on "登録"
    assert_text "新しい温泉"
    click_on "編集", match: :first
    fill_in "名称", with: "編集後温泉"
    click_on "更新"
    assert_text "編集後温泉"
    click_on "削除", match: :first
    assert_no_text "編集後温泉"
  end
end
