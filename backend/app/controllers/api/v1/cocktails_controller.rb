class Api::V1::CocktailsController < ApplicationController
  def index
    cocktails = Cocktail.all

    # 名前で部分一致検索
    if params[:q].present?
      keyword = params[:q].to_s.strip
      like = "%#{ActiveRecord::Base.sanitize_sql_like(keyword)}%"
      cocktails = cocktails.where('name ILIKE ?', like)
    end

    # ベースで絞り込み（単数 or 複数）。例: base=gin,rum または base[]=gin&base[]=rum
    if params[:base].present?
      bases = Array(params[:base]).flat_map { |v| v.to_s.split(',') }.map(&:strip).reject(&:blank?)
      if bases.any?
        # enumのキーのみ許可
        valid = bases & Cocktail.bases.keys
        cocktails = cocktails.where(base: valid.map { |k| Cocktail.bases[k] }) if valid.any?
      end
    end

    # 材料で絞り込み（カンマ/空白区切り）。現状は instructions にキーワードが全て含まれるもの
    if params[:ingredients].present?
      tokens = params[:ingredients].to_s.split(/[\s,、]+/).map(&:strip).reject(&:blank?)
      tokens.each do |tok|
        like = "%#{ActiveRecord::Base.sanitize_sql_like(tok)}%"
        cocktails = cocktails.where('instructions ILIKE ?', like)
      end
    end

    cocktails = cocktails.order(:name)
    render json: cocktails
  end

  def show
    cocktail = Cocktail.includes(cocktail_ingredients: :ingredient).find(params[:id])

    # フロントエンド用のフォーマットに変換
    cocktail_data = cocktail.as_json.merge(
      ingredients: cocktail.ordered_ingredients.map do |ci|
        {
          name: ci.ingredient.name_ja || ci.ingredient.name,
          name_en: ci.ingredient.name,
          amount: ci.amount_ja || ci.amount_text,
          amount_en: ci.amount_text,
          position: ci.position
        }
      end,
      glass_ja: cocktail.glass_ja,
      name_ja: cocktail.name_ja
    )

    render json: cocktail_data
  end

  def todays_pick
    # ランダムに1件のカクテルを取得
    cocktail = Cocktail.order(Arel.sql('RANDOM()')).first

    if cocktail
      # フロントエンド用のフォーマットに変換
      cocktail_data = cocktail.as_json.merge(
        ingredients: cocktail.ordered_ingredients.map do |ci|
          {
            name: ci.ingredient.name_ja || ci.ingredient.name,
            name_en: ci.ingredient.name,
            amount: ci.amount_ja || ci.amount_text,
            amount_en: ci.amount_text,
            position: ci.position
          }
        end,
        glass_ja: cocktail.glass_ja,
        name_ja: cocktail.name_ja
      )
      render json: cocktail_data
    else
      render json: { error: 'No cocktails available' }, status: :not_found
    end
  end
end
