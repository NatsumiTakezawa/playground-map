class CreateAgeGroups < ActiveRecord::Migration[8.0]
  def change
    create_table :age_groups do |t|
      t.string :name
      t.string :min_age
      t.string :max_age

      t.timestamps
    end
  end
end
