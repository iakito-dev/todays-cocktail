Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
     resources :cocktails, only: [:index, :show]
    end
  end
  devise_for :users
  get :health, to: proc { [200, {}, ['OK']] }
end
