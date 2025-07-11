class PlaygroundsController < ApplicationController
def new
  @playground = Playground.new
end

def create
  @playground = Playground.new(playground_params)
  if @playground.save
    redirect_to @playground, notice: "施設を登録しました！"
  else
    render :new
  end
end

private

def playground_params
  params.require(:playground).permit(
    :name, :title, :address, :google_maps_link, :opening_hours, :closed_days,
    :parking_area, :free, :site_link, :play_genre, :nursing_room, :diaper_stand,
    :toilet, :kids_toilet, :baby_keep, :rain, :stroller, :cafe, :bbq, :store,
    :vending_machine, :bring_own_food, :large_playground, :insect_repellent,
    :has_grassy_area, age_group_ids: [], photos: []
  )
end

