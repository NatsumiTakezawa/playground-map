# class AddGenreIdToPlaygrounds < ActiveRecord::Migration[8.0]
#   def change
#     # まずnull: trueでカラムを追加
#     add_reference :playgrounds, :genre, foreign_key: true, null: true
    
#     # 既存データにデフォルト値を設定
#     reversible do |dir|
#       dir.up do
#         # parkジャンルのIDを取得（なければ作成）
#         park_genre = Genre.find_or_create_by(name: 'park')
        
#         # 既存のplaygroundsの play_genre に基づいて genre_id を設定
#         Playground.reset_column_information
#         Playground.find_each do |playground|
#           case playground.play_genre
#           when 'park'
#             playground.update_column(:genre_id, Genre.find_by(name: 'park')&.id)
#           when 'indoor'
#             playground.update_column(:genre_id, Genre.find_by(name: 'indoor')&.id)
#           when 'leisure'
#             playground.update_column(:genre_id, Genre.find_by(name: 'leisure')&.id)
#           when 'water_play'
#             playground.update_column(:genre_id, Genre.find_by(name: 'water_play')&.id)
#           when 'culture'
#             playground.update_column(:genre_id, Genre.find_by(name: 'culture')&.id)
#           when 'community_center'
#             playground.update_column(:genre_id, Genre.find_by(name: 'community_center')&.id)
#           else
#             # デフォルトでparkを設定
#             playground.update_column(:genre_id, park_genre.id)
#           end
#         end
        
#         # 全てのplaygroundにgenre_idが設定されたらNOT NULL制約を追加
#         change_column_null :playgrounds, :genre_id, false
#       end
#     end
#   end
# end

class AddGenreIdToPlaygrounds < ActiveRecord::Migration[8.0]
  def change
    # まずnull: trueでカラムを追加
    add_reference :playgrounds, :genre, foreign_key: true, null: true
    
    # 既存データにデフォルト値を設定
    reversible do |dir|
      dir.up do
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
        
        # 全てのplaygroundにgenre_idが設定されたらNOT NULL制約を追加
        change_column_null :playgrounds, :genre_id, false
      end
    end
  end
end
