class CreatePlaygroundAgeGroups < ActiveRecord::Migration[8.0]
  def change
    create_table :playground_age_groups do |t|
      t.references :playground, null: false, foreign_key: true
      t.references :age_group, null: false, foreign_key: true

      t.timestamps
    end
  end
end
