# -----------------------------------------------------------------------------
# 主要変数の定義
# ここで指定する値は tfvars から上書きし、環境ごとに差し替えやすい形にする
# -----------------------------------------------------------------------------

variable "project_name" {
  description = "プロジェクトを識別する短い名前 (例: todays-cocktail)"
  type        = string
}

variable "environment" {
  description = "デプロイ環境名 (例: prod)"
  type        = string
  default     = "prod"
}

variable "aws_region" {
  description = "AWS リージョン (例: ap-northeast-1)"
  type        = string
  default     = "ap-northeast-1"
}

variable "domain_name" {
  description = "Route53 で管理するルートドメイン (例: todayscocktails.com)"
  type        = string
}

variable "frontend_subdomain" {
  description = "フロントエンド用サブドメイン。Apex を利用する場合は空文字。"
  type        = string
  default     = ""
}

variable "api_subdomain" {
  description = "バックエンド API 用サブドメイン (例: api)"
  type        = string
  default     = "api"
}

variable "vpc_cidr" {
  description = "VPC の CIDR"
  type        = string
  default     = "10.0.0.0/20"
}

variable "availability_zones" {
  description = "利用するアベイラビリティゾーン一覧（サブネットと同数）"
  type        = list(string)
  default     = ["ap-northeast-1a", "ap-northeast-1c"]
}

variable "public_subnet_cidrs" {
  description = "パブリックサブネットの CIDR 一覧"
  type        = list(string)
  default     = ["10.0.0.0/24", "10.0.1.0/24"]
}

variable "private_subnet_cidrs" {
  description = "プライベートサブネットの CIDR 一覧"
  type        = list(string)
  default     = ["10.0.4.0/24", "10.0.5.0/24"]
}

variable "frontend_container_image" {
  description = "フロントエンドコンテナの ECR イメージ (例: <account>.dkr.ecr.ap-northeast-1.amazonaws.com/frontend:latest)"
  type        = string
}

variable "backend_container_image" {
  description = "バックエンドコンテナの ECR イメージ"
  type        = string
}

variable "container_cpu" {
  description = "Fargate タスクの vCPU (単位: 1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "container_memory" {
  description = "Fargate タスクのメモリ (MB)"
  type        = number
  default     = 1024
}

variable "desired_count_frontend" {
  description = "フロントエンドサービスのタスク数"
  type        = number
  default     = 1
}

variable "desired_count_backend" {
  description = "バックエンドサービスのタスク数"
  type        = number
  default     = 1
}

variable "db_name" {
  description = "RDS 初期データベース名"
  type        = string
  default     = "todays_cocktail"
}

variable "db_username" {
  description = "RDS マスターユーザー名"
  type        = string
  default     = "app_user"
}

variable "db_password_ssm_parameter" {
  description = "RDS 接続パスワードを保存する SSM Parameter (SecureString)"
  type        = string
}

variable "db_backup_retention_days" {
  description = "バックアップ保持日数"
  type        = number
  default     = 1
}

variable "default_tags" {
  description = "共通で付与するタグ"
  type        = map(string)
  default = {
    Project     = "todays-cocktail"
    Environment = "prod"
    ManagedBy   = "terraform"
  }
}

variable "frontend_environment" {
  description = "フロントエンドコンテナへ渡す環境変数 (非機密)"
  type        = map(string)
  default     = {}
}

variable "backend_environment" {
  description = "バックエンドコンテナへ渡す環境変数 (非機密)"
  type        = map(string)
  default     = {}
}

variable "backend_secret_values" {
  description = "バックエンドで利用する機密情報 (環境変数名 -> 値)。Parameter Store (SecureString) に保存される。"
  type        = map(string)
  default     = {}
  sensitive   = true
}

variable "create_bastion" {
  description = "Session Manager 用踏み台 EC2 を作成する場合は true"
  type        = bool
  default     = false
}

variable "bastion_instance_type" {
  description = "踏み台 EC2 のインスタンスタイプ"
  type        = string
  default     = "t4g.nano"
}

variable "bastion_subnet_id" {
  description = "踏み台を配置するサブネット ID (未指定の場合は最初のパブリックサブネット)"
  type        = string
  default     = ""
}
