class CreatePlaygrounds < ActiveRecord::Migration[8.0]
  def change
    create_table :playgrounds do |t|
      t.string :name
      t.string :title
      t.string :address
      t.string :google_maps_link
      t.string :opening_hours
      t.string :closed_days
      t.boolean :parking_area
      t.boolean :free
      t.string :site_link
      t.integer :play_genre
      t.boolean :nursing_room
      t.boolean :diaper_stand
      t.boolean :toilet
      t.boolean :kids_toilet
      t.boolean :baby_keep
      t.boolean :rain
      t.boolean :stroller
      t.boolean :cafe
      t.boolean :bbq
      t.boolean :store
      t.boolean :vending_machine
      t.boolean :bring_own_food
      t.boolean :large_playground
      t.boolean :insect_repellent
      t.boolean :has_grassy_area

      t.timestamps
    end
  end
end
