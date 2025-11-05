class Api::V1::CocktailsController < ApplicationController
  def index
    # キャッシュキーを生成（パラメータに応じて変化）
    cache_key = "cocktails_index_#{cache_key_params}"

    # キャッシュから取得、なければクエリ実行
    result = Rails.cache.fetch(cache_key, expires_in: 1.hour) do
      cocktails = Cocktail.all

      # 名前で部分一致検索（日本語名または英語名）
      if params[:q].present?
        keyword = params[:q].to_s.strip
        like = "%#{ActiveRecord::Base.sanitize_sql_like(keyword)}%"
        cocktails = cocktails.where('name ILIKE ? OR name_ja ILIKE ?', like, like)
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

      # ページネーション
      page = [params[:page].to_i, 1].max
      per_page = params[:per_page].to_i
      per_page = 9 if per_page <= 0  # デフォルト9件
      per_page = [per_page, 100].min # 最大100件

      sort = params[:sort].to_s
      filtered_cocktails = cocktails

      total_count = filtered_cocktails.count
      total_pages = (total_count.to_f / per_page).ceil

      cocktails =
        case sort
        when 'popular'
          filtered_cocktails
            .left_joins(:favorites)
            .group('cocktails.id')
            .order(Arel.sql('COUNT(favorites.id) DESC'), 'cocktails.id ASC')
        else
          filtered_cocktails.order(:id)
        end

      paginated_cocktails = cocktails.offset((page - 1) * per_page).limit(per_page)

      # 画像URLと日本語データを含めたレスポンス
      cocktails_with_images = paginated_cocktails.map do |cocktail|
        cocktail.as_json.merge(
          image_url: cocktail.display_image_url,
          name_ja: cocktail.name_ja,
          glass_ja: cocktail.glass_ja
        )
      end

      {
        cocktails: cocktails_with_images,
        meta: {
          current_page: page,
          per_page: per_page,
          total_count: total_count,
          total_pages: total_pages
        }
      }
    end

    render json: result
  end

  def show
    cache_key = "cocktail_show_#{params[:id]}"

    # キャッシュ時間を24時間に延長（カクテル情報はほとんど変わらない）
    cocktail_data = Rails.cache.fetch(cache_key, expires_in: 24.hours) do
      cocktail = Cocktail.includes(cocktail_ingredients: :ingredient).find(params[:id])

      # フロントエンド用のフォーマットに変換
      cocktail.as_json.merge(
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
        name_ja: cocktail.name_ja,
        instructions_ja: cocktail.instructions_ja,
        description: cocktail.description,
        image_url: cocktail.display_image_url
      )
    end

    render json: cocktail_data
  end

  def todays_pick
    # 今日の日付をキーにしてキャッシュ（1日1回変わる）
    today = Date.today.to_s
    cache_key = "todays_pick_#{today}"

    cocktail_data = Rails.cache.fetch(cache_key, expires_in: 1.day) do
      # ランダムに1件のカクテルを取得
      cocktail = Cocktail.includes(cocktail_ingredients: :ingredient).order(Arel.sql('RANDOM()')).first

      if cocktail
        # フロントエンド用のフォーマットに変換
        cocktail.as_json.merge(
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
          name_ja: cocktail.name_ja,
          instructions_ja: cocktail.instructions_ja,
          description: cocktail.description,
          image_url: cocktail.display_image_url
        )
      else
        nil
      end
    end

    if cocktail_data
      render json: cocktail_data
    else
      render json: { error: 'No cocktails available' }, status: :not_found
    end
  end

  private

  def cache_key_params
    {
      q: params[:q],
      base: params[:base],
      ingredients: params[:ingredients],
      page: params[:page],
      per_page: params[:per_page],
      sort: params[:sort]
    }.to_json
  end
end
