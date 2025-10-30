Rails.application.routes.draw do
  # Devise設定（全体で必要）
  devise_for :users, skip: :all

  namespace :api do
    namespace :v1 do
      # 認証エンドポイント
      devise_scope :user do
        post 'signup', to: 'registrations#create'
        post 'login', to: 'sessions#create'
        delete 'logout', to: 'sessions#destroy'
      end

      # カクテルエンドポイント
      resources :cocktails, only: [:index, :show] do
        collection do
          get :todays_pick
        end
      end

      # お気に入りエンドポイント（認証必須）
      resources :favorites, only: [:index, :create, :destroy]
    end
  end

  get :health, to: proc { [200, {}, ['OK']] }
end
