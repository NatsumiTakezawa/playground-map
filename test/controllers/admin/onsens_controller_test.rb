require "test_helper"

class Admin::OnsensControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin_onsen = admin_onsens(:one)
  end

  test "should get index" do
    get admin_onsens_url
    assert_response :success
  end

  test "should get new" do
    get new_admin_onsen_url
    assert_response :success
  end

  test "should create admin_onsen" do
    assert_difference("Admin::Onsen.count") do
      post admin_onsens_url, params: { admin_onsen: { description: @admin_onsen.description, geo_lat: @admin_onsen.geo_lat, geo_lng: @admin_onsen.geo_lng, name: @admin_onsen.name, tags: @admin_onsen.tags } }
    end

    assert_redirected_to admin_onsen_url(Admin::Onsen.last)
  end

  test "should show admin_onsen" do
    get admin_onsen_url(@admin_onsen)
    assert_response :success
  end

  test "should get edit" do
    get edit_admin_onsen_url(@admin_onsen)
    assert_response :success
  end

  test "should update admin_onsen" do
    patch admin_onsen_url(@admin_onsen), params: { admin_onsen: { description: @admin_onsen.description, geo_lat: @admin_onsen.geo_lat, geo_lng: @admin_onsen.geo_lng, name: @admin_onsen.name, tags: @admin_onsen.tags } }
    assert_redirected_to admin_onsen_url(@admin_onsen)
  end

  test "should destroy admin_onsen" do
    assert_difference("Admin::Onsen.count", -1) do
      delete admin_onsen_url(@admin_onsen)
    end

    assert_redirected_to admin_onsens_url
  end
end
