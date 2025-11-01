# frozen_string_literal: true

namespace :cocktails do
  desc 'Fetch cocktail images from Unsplash'
  task fetch_unsplash_images: :environment do
    puts "Fetching cocktail images from Unsplash..."
    puts "=" * 50
    
    service = UnsplashImageService.new
    
    # 画像が添付されていないカクテルを取得
    cocktails_without_images = Cocktail.left_joins(:image_attachment)
                                       .where(active_storage_attachments: { id: nil })
                                       .order(:name)
    
    if cocktails_without_images.empty?
      puts "All cocktails already have images!"
      exit
    end
    
    puts "Found #{cocktails_without_images.count} cocktails without images"
    puts ""
    
    result = service.batch_fetch_images(cocktails_without_images)
    
    puts "\n" + "=" * 50
    puts "Summary:"
    puts "  ✅ Success: #{result[:success]}"
    puts "  ❌ Failed:  #{result[:failure]}"
    puts "  📊 Total:   #{result[:total]}"
    puts "=" * 50
  end

  desc 'Refresh all cocktail images from Unsplash'
  task refresh_unsplash_images: :environment do
    puts "Refreshing ALL cocktail images from Unsplash..."
    puts "⚠️  This will replace existing images!"
    puts "=" * 50
    
    service = UnsplashImageService.new
    cocktails = Cocktail.order(:name)
    
    puts "Processing #{cocktails.count} cocktails"
    puts ""
    
    result = service.batch_fetch_images(cocktails)
    
    puts "\n" + "=" * 50
    puts "Summary:"
    puts "  ✅ Success: #{result[:success]}"
    puts "  ❌ Failed:  #{result[:failure]}"
    puts "  📊 Total:   #{result[:total]}"
    puts "=" * 50
  end

  desc 'Fetch image for a specific cocktail'
  task :fetch_cocktail_image, [:name] => :environment do |t, args|
    cocktail_name = args[:name]
    
    unless cocktail_name
      puts "Usage: rake cocktails:fetch_cocktail_image[\"Mojito\"]"
      exit
    end
    
    cocktail = Cocktail.find_by(name: cocktail_name)
    
    unless cocktail
      puts "❌ Cocktail not found: #{cocktail_name}"
      exit
    end
    
    service = UnsplashImageService.new
    
    puts "Fetching image for: #{cocktail.name}"
    
    if service.fetch_and_attach_cocktail_image(cocktail, force: true)
      puts "✅ Successfully fetched image!"
    else
      puts "❌ Failed to fetch image"
    end
  end
end
