require "test_helper"

class Admin::OnsensControllerTest < ActionDispatch::IntegrationTest
  fixtures :onsens
  setup do
    @onsen = onsens(:one)
  end

  test "should get index" do
    get admin_onsens_url
    assert_response :success
  end

  test "should get new" do
    get new_admin_onsen_url
    assert_response :success
  end

  test "should create onsen" do
    assert_difference("Onsen.count") do
      post admin_onsens_url, params: { onsen: { description: @onsen.description, geo_lat: @onsen.geo_lat, geo_lng: @onsen.geo_lng, name: @onsen.name, tags: @onsen.tags } }
    end

    assert_redirected_to admin_onsen_url(Onsen.last)
  end

  test "should show onsen" do
    get admin_onsen_url(@onsen)
    assert_response :success
  end

  test "should get edit" do
    get edit_admin_onsen_url(@onsen)
    assert_response :success
  end

  test "should update onsen" do
    patch admin_onsen_url(@onsen), params: { onsen: { description: @onsen.description, geo_lat: @onsen.geo_lat, geo_lng: @onsen.geo_lng, name: @onsen.name, tags: @onsen.tags } }
    assert_redirected_to admin_onsen_url(@onsen)
  end

  test "should destroy onsen" do
    assert_difference("Onsen.count", -1) do
      delete admin_onsen_url(@onsen)
    end

    assert_redirected_to admin_onsens_url
  end
end
