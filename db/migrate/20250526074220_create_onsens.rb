class CreateOnsens < ActiveRecord::Migration[8.0]
  def change
    create_table :onsens do |t|
      t.string :name, limit: 100
      t.decimal :geo_lat
      t.decimal :geo_lng
      t.text :description
      t.string :tags

      t.timestamps
    end
  end
end
