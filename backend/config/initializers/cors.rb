# CORS（Cross-Origin Resource Sharing）設定
# フロントエンドアプリケーションからAPIサーバーへの
# クロスオリジンリクエストを許可するための設定

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    # 許可するオリジン（フロントエンドのURL）
    # 環境変数から取得、デフォルトはローカル開発環境
    origins ENV.fetch("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

    # 許可するリソース・設定
    resource "*",                                    # 全てのAPIエンドポイントを許可
      headers: :any,                                # 全てのHTTPヘッダーを許可
      methods: %i[get post put patch delete options head],  # REST APIで使用する全HTTPメソッドを許可
      expose: %w[Authorization],                    # Authorizationヘッダーをフロントエンドから読み取り可能にする（JWT認証等で使用）
      credentials: true                             # クッキー・認証情報の送信を許可
  end
end
