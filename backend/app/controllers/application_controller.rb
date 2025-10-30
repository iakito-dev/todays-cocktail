class ApplicationController < ActionController::API
  include ActionController::MimeResponds

  before_action :configure_permitted_parameters, if: :devise_controller?

  # Devise + JWT認証のためのヘルパーメソッド
  def authenticate_user!
    # Authorizationヘッダーから手動でJWTトークンを抽出・検証
    token = request.headers['Authorization']&.split(' ')&.last
    return render_unauthorized unless token

    begin
      decoded_token = JWT.decode(
        token,
        Rails.application.credentials.devise_jwt_secret_key || ENV['DEVISE_JWT_SECRET_KEY'],
        true,
        { algorithm: 'HS256' }
      )

      jti = decoded_token[0]['jti']
      user_id = decoded_token[0]['sub']

      # トークンが無効化リストに存在するか確認
      if JwtDenylist.exists?(jti: jti)
        return render_unauthorized
      end

      @current_user = User.find(user_id)
    rescue JWT::DecodeError, JWT::ExpiredSignature, ActiveRecord::RecordNotFound => e
      render_unauthorized
    end
  end

  def current_user
    @current_user
  end

  def user_signed_in?
    current_user.present?
  end

  private

  def render_unauthorized
    render json: { error: '認証が必要です。ログインしてください。' }, status: :unauthorized
  end

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:email, :password, :password_confirmation])
    devise_parameter_sanitizer.permit(:sign_in, keys: [:email, :password])
    devise_parameter_sanitizer.permit(:account_update, keys: [:email, :password, :password_confirmation, :current_password])
  end
end
