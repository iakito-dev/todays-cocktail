Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
     resources :cocktails, only: [:index, :show] do
       collection do
         get :todays_pick
       end
     end
    end
  end
  devise_for :users
  get :health, to: proc { [200, {}, ['OK']] }
end
