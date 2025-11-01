# frozen_string_literal: true

module Api
  module V1
    module Admin
      class CocktailsController < ApplicationController
        before_action :authenticate_user!
        before_action :require_admin!
        before_action :set_cocktail, only: [:update]

        # PUT /api/v1/admin/cocktails/:id
        def update
          if @cocktail.update(cocktail_params)
            cocktail_data = @cocktail.as_json.merge(
              ingredients: @cocktail.ordered_ingredients.map do |ci|
                {
                  name: ci.ingredient.name_ja || ci.ingredient.name,
                  name_en: ci.ingredient.name,
                  amount: ci.amount_ja || ci.amount_text,
                  amount_en: ci.amount_text,
                  position: ci.position
                }
              end,
              glass_ja: @cocktail.glass_ja,
              name_ja: @cocktail.name_ja,
              instructions_ja: @cocktail.instructions_ja,
              image_url: @cocktail.display_image_url
            )
            render json: cocktail_data
          else
            render json: { errors: @cocktail.errors.full_messages }, status: :unprocessable_entity
          end
        end

        private

        def set_cocktail
          @cocktail = Cocktail.find(params[:id])
        end

        def cocktail_params
          params.require(:cocktail).permit(
            :name,
            :name_ja,
            :glass,
            :glass_ja,
            :instructions,
            :instructions_ja,
            :base,
            :strength,
            :technique,
            :image_url_override
          )
        end

        def require_admin!
          unless current_user&.admin?
            render json: { error: 'Admin access required' }, status: :forbidden
          end
        end
      end
    end
  end
end
