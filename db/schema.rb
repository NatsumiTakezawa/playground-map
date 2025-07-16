# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_07_16_092620) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "age_groups", force: :cascade do |t|
    t.string "name"
    t.string "min_age"
    t.string "max_age"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "genres", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "onsens", force: :cascade do |t|
    t.string "name", limit: 100
    t.decimal "geo_lat"
    t.decimal "geo_lng"
    t.text "description"
    t.string "tags"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "playground_age_groups", force: :cascade do |t|
    t.bigint "playground_id", null: false
    t.bigint "age_group_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["age_group_id"], name: "index_playground_age_groups_on_age_group_id"
    t.index ["playground_id"], name: "index_playground_age_groups_on_playground_id"
  end

  create_table "playgrounds", force: :cascade do |t|
    t.string "name"
    t.string "title"
    t.string "address"
    t.string "google_maps_link"
    t.string "opening_hours"
    t.string "closed_days"
    t.boolean "parking_area"
    t.boolean "free"
    t.string "site_link"
    t.boolean "nursing_room"
    t.boolean "diaper_stand"
    t.boolean "toilet"
    t.boolean "kids_toilet"
    t.boolean "baby_keep"
    t.boolean "rain"
    t.boolean "stroller"
    t.boolean "cafe"
    t.boolean "bbq"
    t.boolean "store"
    t.boolean "vending_machine"
    t.boolean "bring_own_food"
    t.boolean "large_playground"
    t.boolean "insect_repellent"
    t.boolean "has_grassy_area"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "genre_id", null: false
    t.index ["genre_id"], name: "index_playgrounds_on_genre_id"
  end

  create_table "reviews", force: :cascade do |t|
    t.integer "rating"
    t.text "comment"
    t.bigint "onsen_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["onsen_id"], name: "index_reviews_on_onsen_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "playground_age_groups", "age_groups"
  add_foreign_key "playground_age_groups", "playgrounds"
  add_foreign_key "playgrounds", "genres"
  add_foreign_key "reviews", "onsens"
end
