class CreateReviews < ActiveRecord::Migration[8.0]
  def change
    create_table :reviews do |t|
      t.integer :rating
      t.text :comment
      t.references :onsen, null: false, foreign_key: true

      t.timestamps
    end
  end
end
