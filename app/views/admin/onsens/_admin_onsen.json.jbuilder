json.extract! admin_onsen, :id, :name, :geo_lat, :geo_lng, :description, :tags, :created_at, :updated_at
json.url admin_onsen_url(admin_onsen, format: :json)
