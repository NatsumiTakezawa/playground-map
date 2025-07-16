module PlaygroundsHelper
  def genre_name_in_japanese(genre_name)
    {
      "park" => "公園",
      "indoor" => "屋内（ボールプール・屋内遊園地）",
      "leisure" => "レジャー施設・体験施設",
      "water_play" => "水遊び",
      "culture" => "文化・教育",
      "community_center" => "児童館・地域福祉センター"
    }[genre_name] || genre_name
  end
end
