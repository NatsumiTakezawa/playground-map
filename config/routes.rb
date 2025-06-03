Rails.application.routes.draw do
  resources :onsens, only: %i[index show] do
    resources :reviews, only: [:create, :new]
  end
  namespace :admin do
    resources :onsens
    resources :csv_imports, only: [:new, :create]
  end
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  get "manifest" => "pwa#manifest", as: :pwa_manifest
  get "service-worker" => "pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  root "onsens#index"
end
