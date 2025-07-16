class PlaygroundsController < ApplicationController
  def index
    @playgrounds = Playground.all
  end

  def show
    @playground = Playground.find(params[:id])
  end

  def new
    @playground = Playground.new
  end

  def create
    @playground = Playground.new(playground_params)
    if @playground.save
      redirect_to @playground, notice: "登録しました"
    else
      render :new
    end
  end

  def edit
    @playground = Playground.find(params[:id])
  end

  def update
    @playground = Playground.find(params[:id])
    if @playground.update(playground_params)
      redirect_to @playground, notice: "更新しました"
    else
      render :edit
    end
  end

private

def playground_params
  params.require(:playground).permit(
    :name, :title, :address, :google_maps_link, :opening_hours, :closed_days,
    :parking_area, :free, :site_link, :genre_id, :nursing_room, :diaper_stand,
    :toilet, :kids_toilet, :baby_keep, :rain, :stroller, :cafe, :bbq, :store,
    :vending_machine, :bring_own_food, :large_playground, :insect_repellent,
    :has_grassy_area, age_group_ids: [], photos: []
  )
end

end
