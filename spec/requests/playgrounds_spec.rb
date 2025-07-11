require 'rails_helper'

RSpec.describe "Playgrounds", type: :request do
  describe "GET /index" do
    it "returns http success" do
      get "/playgrounds/index"
      expect(response).to have_http_status(:success)
    end
  end

  describe "GET /show" do
    it "returns http success" do
      get "/playgrounds/show"
      expect(response).to have_http_status(:success)
    end
  end

end
