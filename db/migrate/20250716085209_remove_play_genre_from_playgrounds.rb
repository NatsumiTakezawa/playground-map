class RemovePlayGenreFromPlaygrounds < ActiveRecord::Migration[8.0]
  def change
    remove_column :playgrounds, :play_genre, :integer
  end
end
