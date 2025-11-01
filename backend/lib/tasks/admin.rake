# frozen_string_literal: true

namespace :admin do
  desc "管理者アカウントを作成または更新"
  task setup: :environment do
    email = ENV['ADMIN_EMAIL']
    password = ENV['ADMIN_PASSWORD']
    name = ENV['ADMIN_NAME'] || 'Admin'

    if email.blank? || password.blank?
      puts "❌ エラー: ADMIN_EMAIL と ADMIN_PASSWORD を.envファイルに設定してください"
      exit 1
    end

    user = User.find_or_initialize_by(email: email)
    
    if user.new_record?
      user.password = password
      user.name = name
      user.admin = true
      user.skip_confirmation! # メール確認をスキップ
      
      if user.save
        puts "✅ 管理者アカウントを作成しました"
        puts "   Email: #{user.email}"
        puts "   Name: #{user.name}"
      else
        puts "❌ エラー: 管理者アカウントの作成に失敗しました"
        puts user.errors.full_messages.join("\n")
        exit 1
      end
    else
      # 既存ユーザーを管理者に昇格
      user.admin = true
      user.name = name if user.name.blank?
      user.confirm unless user.confirmed? # 未確認の場合は確認する
      
      if user.save
        puts "✅ 既存アカウントを管理者に設定しました"
        puts "   Email: #{user.email}"
        puts "   Name: #{user.name}"
      else
        puts "❌ エラー: 管理者権限の設定に失敗しました"
        puts user.errors.full_messages.join("\n")
        exit 1
      end
    end
  end

  desc "管理者一覧を表示"
  task list: :environment do
    admins = User.where(admin: true)
    
    if admins.empty?
      puts "管理者アカウントが見つかりません"
    else
      puts "管理者アカウント一覧:"
      admins.each do |admin|
        puts "  - #{admin.email} (#{admin.name})"
      end
    end
  end

  desc "指定したユーザーを管理者に昇格"
  task :promote, [:email] => :environment do |_t, args|
    email = args[:email]
    
    if email.blank?
      puts "使用方法: rails admin:promote[user@example.com]"
      exit 1
    end

    user = User.find_by(email: email)
    
    if user.nil?
      puts "❌ エラー: #{email} のユーザーが見つかりません"
      exit 1
    end

    if user.admin?
      puts "ℹ️  #{email} は既に管理者です"
    else
      user.update!(admin: true)
      puts "✅ #{email} を管理者に昇格しました"
    end
  end

  desc "指定したユーザーの管理者権限を削除"
  task :demote, [:email] => :environment do |_t, args|
    email = args[:email]
    
    if email.blank?
      puts "使用方法: rails admin:demote[user@example.com]"
      exit 1
    end

    user = User.find_by(email: email)
    
    if user.nil?
      puts "❌ エラー: #{email} のユーザーが見つかりません"
      exit 1
    end

    if !user.admin?
      puts "ℹ️  #{email} は管理者ではありません"
    else
      user.update!(admin: false)
      puts "✅ #{email} の管理者権限を削除しました"
    end
  end
end
