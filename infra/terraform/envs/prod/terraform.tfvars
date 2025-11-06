# 本番構成で利用する値を定義
project_name              = "todays-cocktail"
environment               = "prod"
domain_name               = "todayscocktails.com"
frontend_subdomain        = ""
api_subdomain             = "api"
availability_zones        = ["ap-northeast-1a", "ap-northeast-1c"]
public_subnet_cidrs       = ["10.0.0.0/24", "10.0.1.0/24"]
private_subnet_cidrs      = ["10.0.4.0/24", "10.0.5.0/24"]
frontend_container_image  = "767397658523.dkr.ecr.ap-northeast-1.amazonaws.com/todays-cocktail-frontend:latest"
backend_container_image   = "767397658523.dkr.ecr.ap-northeast-1.amazonaws.com/todays-cocktail-backend:latest"
db_password_ssm_parameter = "/todays-cocktail/prod/db/master_password"

create_bastion          = true
# bastion_instance_type = "t4g.nano"
# bastion_subnet_id     = "subnet-xxxxxxxx" # デフォルトは最初のパブリックサブネット

default_tags = {
  Project     = "todays-cocktail"
  Environment = "prod"
  ManagedBy   = "terraform"
}

frontend_environment = {
  VITE_API_BASE_URL = "https://api.todayscocktails.com" # TODO: API の実ドメインに合わせて更新
}

backend_environment = {
  ALLOWED_ORIGINS   = "https://todayscocktails.com,https://todays-cocktails.vercel.app,http://localhost:5173"
  FRONTEND_URL      = "https://todayscocktails.com"
  MAIL_FROM_ADDRESS = "noreply@todayscocktails.com"
  RAILS_ENV         = "production"
}

# 機密情報は infra/terraform/envs/prod/backend-secrets.auto.tfvars に定義してください
