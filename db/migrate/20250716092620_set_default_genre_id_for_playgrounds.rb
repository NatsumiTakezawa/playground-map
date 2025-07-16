class SetDefaultGenreIdForPlaygrounds < ActiveRecord::Migration[8.0]
  def up
    # genre_idがNULLのレコードのみにデフォルト値（park = 1）を設定
    # 既存の有効なgenre_idは保持される
    execute <<-SQL
      UPDATE playgrounds SET genre_id = 1 WHERE genre_id IS NULL
    SQL
    
    # genre_idにNOT NULL制約を追加
    change_column_null :playgrounds, :genre_id, false
  end

  def down
    # ダウンマイグレーションでは制約を緩める
    change_column_null :playgrounds, :genre_id, true
  end
end

