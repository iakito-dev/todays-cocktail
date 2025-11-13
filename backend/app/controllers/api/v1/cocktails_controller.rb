class Api::V1::CocktailsController < ApplicationController
  require "digest"
  def index
    # キャッシュキーを生成（パラメータに応じて変化）
    cache_key = "cocktails_index_#{cache_key_params}"

    # キャッシュから取得、なければクエリ実行
    # データは基本的に不変のためキャッシュを長めにする
    result = Rails.cache.fetch(cache_key, expires_in: 12.hours) do
      cocktails = Cocktail.all

      # 名前/材料/手順をまとめてキーワード検索
      keyword_tokens = tokenize_keywords(params[:q])
      keyword_tokens += tokenize_keywords(params[:ingredients]) if params[:ingredients].present?
      if keyword_tokens.any?
        cocktails = apply_keyword_filter(cocktails, keyword_tokens.uniq)
      end

      # ベースで絞り込み（単数 or 複数）。例: base=gin,rum または base[]=gin&base[]=rum
      if params[:base].present?
        bases = Array(params[:base]).flat_map { |v| v.to_s.split(",") }.map(&:strip).reject(&:blank?)
        if bases.any?
          # enumのキーのみ許可
          valid = bases & Cocktail.bases.keys
          cocktails = cocktails.where(base: valid.map { |k| Cocktail.bases[k] }) if valid.any?
        end
      end

      # ページネーション
      page = [ params[:page].to_i, 1 ].max
      per_page = params[:per_page].to_i
      per_page = 9 if per_page <= 0  # デフォルト9件
      per_page = [ per_page, 100 ].min # 最大100件

      sort = params[:sort].presence || "id"
      filtered_cocktails = cocktails

      total_count = filtered_cocktails.count
      total_pages = (total_count.to_f / per_page).ceil

      cocktails =
        case sort
        when "popular"
          filtered_cocktails
            .left_joins(:favorites)
            .group("cocktails.id")
            .order(Arel.sql("COUNT(favorites.id) DESC"), "cocktails.id ASC")
        else
          filtered_cocktails.order(:id)
        end

      # 必要な列のみSELECTして転送量を削減
      paginated_cocktails = cocktails
        .select(:id, :name, :name_ja, :glass_ja, :image_url_override)
        .offset((page - 1) * per_page)
        .limit(per_page)

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

    # 条件付きGET（ETag）で転送量を削減
    etag = Digest::SHA256.hexdigest(ActiveSupport::JSON.encode(result))
    if stale?(etag: etag, public: true)
      # クライアント/エッジでもキャッシュ。共有キャッシュも意識してs-maxageを付与
      response.set_header("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400, stale-if-error=86400")
      render json: result
    else
      head :not_modified
    end
  end

  def show
    cache_key = "cocktail_show_#{params[:id]}"

    # 基本的に更新されない前提で長めにキャッシュ
    cocktail_data = Rails.cache.fetch(cache_key, expires_in: 30.days) do
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

    # ETagベースの条件付きGET対応（JSON内容から強ETag生成）
    etag = Digest::SHA256.hexdigest(ActiveSupport::JSON.encode(cocktail_data))
    if stale?(etag: etag, public: true)
      response.set_header("Cache-Control", "public, max-age=604800, s-maxage=604800, stale-while-revalidate=86400, stale-if-error=86400")
      render json: cocktail_data
    else
      head :not_modified
    end
  end

  def todays_pick
    # 今日の日付をキーにしてキャッシュ（1日1回変わる）
    today = Date.today.to_s
    cache_key = "todays_pick_#{today}"

    cocktail_data = Rails.cache.fetch(cache_key, expires_in: 1.day) do
      # ランダム取得の高速化: ORDER BY RANDOM() は避けて count + offset を利用
      total = Rails.cache.fetch("cocktails_total_count", expires_in: 12.hours) { Cocktail.count }
      offset = total > 0 ? rand(total) : 0
      cocktail = Cocktail
        .includes(cocktail_ingredients: :ingredient)
        .offset(offset)
        .first

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
      # その日の間はクライアント/エッジでもキャッシュ
      etag = Digest::SHA256.hexdigest(ActiveSupport::JSON.encode(cocktail_data))
      if stale?(etag: etag, public: true)
        response.set_header("Cache-Control", "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400, stale-if-error=86400")
        render json: cocktail_data
      else
        head :not_modified
      end
    else
      render json: { error: "No cocktails available" }, status: :not_found
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
      sort: params[:sort].presence || "id"
    }.to_json
  end

  def tokenize_keywords(raw)
    return [] unless raw.present?
    raw.to_s.split(/[\s,、]+/).map(&:strip).reject(&:blank?)
  end

  def apply_keyword_filter(scope, tokens)
    scope = scope.left_outer_joins(:ingredients)
    tokens.each do |tok|
      like = "%#{ActiveRecord::Base.sanitize_sql_like(tok)}%"
      scope = scope.where(
        <<~SQL.squish,
          cocktails.name ILIKE :like
            OR cocktails.name_ja ILIKE :like
            OR ingredients.name ILIKE :like
            OR ingredients.name_ja ILIKE :like
            OR cocktails.instructions ILIKE :like
            OR cocktails.instructions_ja ILIKE :like
        SQL
        like: like
      )
    end
    scope.distinct
  end
end
