class Api::V1::CocktailsController < ApplicationController
  def index
    cocktails = Cocktail.all
    render json: cocktails
  end

  def show
    cocktail = Cocktail.find(params[:id])
    render json: cocktail
  end
end
