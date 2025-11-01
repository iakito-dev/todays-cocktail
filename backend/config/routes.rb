Rails.application.routes.draw do
  # Devise設定（全体で必要）
  # デフォルトのDeviseルートはスキップ（api/v1配下でカスタムAPIルートを定義しているため）
  devise_for :users, skip: :all

  namespace :api do
    namespace :v1 do
      # 認証エンドポイント
      devise_scope :user do
        post 'signup', to: 'registrations#create'
        post 'login', to: 'sessions#create'
        delete 'logout', to: 'sessions#destroy'
        get 'confirmation', to: 'confirmations#show'
        post 'confirmation', to: 'confirmations#create'
      end

      # ユーザーエンドポイント
      get 'users/me', to: 'users#me'

      # カクテルエンドポイント
      resources :cocktails, only: [:index, :show] do
        collection do
          get :todays_pick
        end
      end

      # お気に入りエンドポイント（認証必須）
      resources :favorites, only: [:index, :create, :destroy]

      # 管理者専用エンドポイント（認証 + 管理者権限必須）
      namespace :admin do
        resources :cocktails, only: [:update]
      end
    end
  end

  get :health, to: proc { [200, {}, ['OK']] }
end
