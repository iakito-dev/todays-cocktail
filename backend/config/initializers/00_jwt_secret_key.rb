# frozen_string_literal: true

# JWT 署名・検証に使う秘密鍵を一元管理する。
# 優先順位: credentials > 環境変数 > secret_key_base
secret_source =
  Rails.application.credentials.devise_jwt_secret_key ||
  ENV["DEVISE_JWT_SECRET_KEY"] ||
  Rails.application.secret_key_base

Rails.application.config.x.jwt_secret_key = secret_source.to_s
