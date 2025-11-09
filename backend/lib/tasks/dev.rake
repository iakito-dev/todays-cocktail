namespace :dev do
  desc "開発環境用: ユーザーのメールアドレスを確認済みにする"
  task :confirm_user, [ :email ] => :environment do |_t, args|
    email = args[:email]

    unless email
      puts "使用方法: bin/rails dev:confirm_user[user@example.com]"
      exit 1
    end

    user = User.find_by(email: email)

    unless user
      puts "❌ ユーザーが見つかりません: #{email}"
      exit 1
    end

    if user.confirmed?
      puts " #{email} は既に確認済みです。"
    else
      user.confirm
      puts " #{email} を確認済みにしました。"
    end
  end

  desc "開発環境用: 未確認ユーザーの一覧を表示"
  task unconfirmed_users: :environment do
    unconfirmed = User.where(confirmed_at: nil)

    if unconfirmed.empty?
      puts " 未確認のユーザーはいません。"
    else
      puts "未確認ユーザー一覧:"
      unconfirmed.each do |user|
        puts "  - #{user.email} (#{user.name}) - 作成日: #{user.created_at}"
        puts "    確認トークン: #{user.confirmation_token}"
        puts "    確認URL: http://localhost:5173/confirm?confirmation_token=#{user.confirmation_token}"
        puts ""
      end
    end
  end

  desc "開発環境用: すべてのユーザーを確認済みにする"
  task confirm_all_users: :environment do
    unconfirmed = User.where(confirmed_at: nil)

    if unconfirmed.empty?
      puts " 未確認のユーザーはいません。"
    else
      count = 0
      unconfirmed.each do |user|
        user.confirm
        count += 1
        puts " #{user.email} を確認済みにしました。"
      end
      puts "\n合計 #{count} 人のユーザーを確認済みにしました。"
    end
  end
end
