class AddGenreIdToPlaygrounds < ActiveRecord::Migration[8.0]
  def change
    # まずnull: trueでカラムを追加
    add_reference :playgrounds, :genre, foreign_key: true, null: true
    
    # 既存データにデフォルト値を設定
    reversible do |dir|
      dir.up do
        # play_genreカラムが存在する場合のみ変換処理を実行
        if column_exists?(:playgrounds, :play_genre)
          # 直接SQLでデータを更新（モデルクラスを使わない方法）
          execute <<-SQL
            UPDATE playgrounds SET genre_id = 
              CASE play_genre
                WHEN 0 THEN 1  -- park
                WHEN 1 THEN 2  -- indoor
                WHEN 2 THEN 3  -- leisure
                WHEN 3 THEN 4  -- water_play
                WHEN 4 THEN 5  -- culture
                WHEN 5 THEN 6  -- community_center
                ELSE 1         -- デフォルトはpark
              END
          SQL
        else
          # play_genreカラムが存在しない場合はデフォルト値を設定
          execute "UPDATE playgrounds SET genre_id = 1 WHERE genre_id IS NULL"
        end
        
        # 全てのplaygroundにgenre_idが設定されたらNOT NULL制約を追加
        change_column_null :playgrounds, :genre_id, false
      end
    end
  end
end
