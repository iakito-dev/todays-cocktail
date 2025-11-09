# letter_opener gem configuration
# Docker環境でもブラウザを開こうとしないように設定

if Rails.env.development?
  # Launchyがブラウザを開こうとするのを防ぐ
  # LAUNCHY_DRY_RUN環境変数を設定することで、実際にブラウザを開かない
  ENV["LAUNCHY_DRY_RUN"] = "true"

  LetterOpener.configure do |config|
    config.location = Rails.root.join("tmp", "letter_opener")
    config.message_template = :light
  end
end
