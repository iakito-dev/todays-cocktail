# -----------------------------------------------------------------------------
# todays-cocktail インフラのメイン定義
# Cloudflare で DNS を管理しつつ、AWS 上に最小構成を構築する
# -----------------------------------------------------------------------------

locals {
  # リソース名やタグ整形に利用する共通プレフィックス
  name_prefix = "${var.project_name}-${var.environment}"
  backend_secret_parameter_map = {
    for key in keys(nonsensitive(var.backend_secret_values)) :
    key => "/${var.project_name}/${var.environment}/backend/${key}"
  }
}

# -----------------------------------------------------------------------------
# 基盤リソース (VPC / ECS クラスター)
# -----------------------------------------------------------------------------

resource "aws_ecs_cluster" "this" {
  # Fargate サービスを束ねる ECS クラスターは 1 つのみを想定
  name = "${local.name_prefix}-cluster"
}

module "network" {
  source = "./modules/network"

  name_prefix          = local.name_prefix
  vpc_cidr             = var.vpc_cidr
  availability_zones   = var.availability_zones
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
}

# Session Manager 経由で接続する踏み台 EC2 (必要な場合のみ作成)
module "bastion" {
  count = var.create_bastion ? 1 : 0

  source = "./modules/bastion"

  name_prefix  = local.name_prefix
  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.network.vpc_id
  subnet_id    = var.bastion_subnet_id != "" ? var.bastion_subnet_id : module.network.public_subnet_ids[0]
  instance_type = var.bastion_instance_type
  default_tags  = var.default_tags
}

# -----------------------------------------------------------------------------
# 証明書 (ACM) - DNS 検証は Cloudflare で手動登録する
# -----------------------------------------------------------------------------

module "acm" {
  source = "./modules/acm"

  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  domain_name = var.domain_name
  subject_alternative_names = compact([
    var.frontend_subdomain != "" ? "${var.frontend_subdomain}.${var.domain_name}" : null,
    "${var.api_subdomain}.${var.domain_name}"
  ])
}

# 機密情報を Parameter Store (SecureString) に登録
resource "aws_ssm_parameter" "backend_secrets" {
  for_each = local.backend_secret_parameter_map

  name  = each.value
  type  = "SecureString"
  value = var.backend_secret_values[each.key]
}

# -----------------------------------------------------------------------------
# IAM ロール / セキュリティ
# -----------------------------------------------------------------------------

module "iam" {
  source = "./modules/iam"

  name_prefix  = local.name_prefix
  project_name = var.project_name
  environment  = var.environment
  allow_secrets = concat(
    [var.db_password_ssm_parameter],
    values(local.backend_secret_parameter_map)
  )
}

# -----------------------------------------------------------------------------
# ミドルウェア層 (ALB, RDS)
# -----------------------------------------------------------------------------

module "alb" {
  # HTTPS 終端とパスベース振り分けを担う ALB
  source = "./modules/alb"

  name_prefix                  = local.name_prefix
  vpc_id                       = module.network.vpc_id
  public_subnet_ids            = module.network.public_subnet_ids
  health_check_path_frontend   = "/"
  health_check_path_backend    = "/api/health"
  allow_cidrs_inbound          = ["0.0.0.0/0"]
  acm_listener_certificate_arn = module.acm.alb_certificate_arn
}

module "rds" {
  # RDS for PostgreSQL (db.t4g.micro) の最小構成。パスワードは自動生成して SSM へ格納。
  source = "./modules/rds"

  name_prefix               = local.name_prefix
  environment               = var.environment
  vpc_id                    = module.network.vpc_id
  subnet_ids                = module.network.private_subnet_ids
  db_name                   = var.db_name
  db_username               = var.db_username
  db_password_ssm_parameter = var.db_password_ssm_parameter
  backup_retention          = var.db_backup_retention_days
}

# -----------------------------------------------------------------------------
# アプリケーション層 (ECS Frontend / Backend)
# -----------------------------------------------------------------------------

module "ecs_frontend" {
  # フロントエンドアプリ (例: Next.js) をホストする Fargate サービス
  source = "./modules/ecs_service"

  name_prefix               = "${local.name_prefix}-frontend"
  cluster_name              = aws_ecs_cluster.this.name
  cluster_arn               = aws_ecs_cluster.this.arn
  vpc_id                    = module.network.vpc_id
  subnet_ids                = module.network.public_subnet_ids
  assign_public_ip          = true
  container_image           = var.frontend_container_image
  container_port            = 3000
  desired_count             = var.desired_count_frontend
  cpu                       = var.container_cpu
  memory                    = var.container_memory
  log_retention_in_days     = 7
  execution_role_arn        = module.iam.ecs_execution_role_arn
  task_role_arn             = module.iam.frontend_task_role_arn
  target_group_arn          = module.alb.frontend_target_group_arn
  health_check_grace_period = 60
  environment_variables = merge(
    {
      BACKEND_BASE_URL = "https://${var.api_subdomain == "" ? "api" : var.api_subdomain}.${var.domain_name}"
    },
    var.frontend_environment
  )
  allowed_source_security_group_ids = [module.alb.security_group_id]
}

module "ecs_backend" {
  # API サーバー用の Fargate サービス。RDS 接続設定を環境変数/シークレットで注入。
  source = "./modules/ecs_service"

  providers = {
    aws = aws
  }

  name_prefix               = "${local.name_prefix}-backend"
  cluster_name              = aws_ecs_cluster.this.name
  cluster_arn               = aws_ecs_cluster.this.arn
  vpc_id                    = module.network.vpc_id
  subnet_ids                = module.network.public_subnet_ids
  assign_public_ip          = true
  container_image           = var.backend_container_image
  container_port            = 8080
  desired_count             = var.desired_count_backend
  cpu                       = var.container_cpu
  memory                    = var.container_memory
  log_retention_in_days     = 7
  execution_role_arn        = module.iam.ecs_execution_role_arn
  task_role_arn             = module.iam.backend_task_role_arn
  target_group_arn          = module.alb.backend_target_group_arn
  health_check_grace_period = 120
  environment_variables = merge(
    {
      DATABASE_HOST = module.rds.db_endpoint
      DATABASE_NAME = var.db_name
      DATABASE_USER = var.db_username
    },
    var.backend_environment
  )
  secrets = merge(
    local.backend_secret_parameter_map,
    {
      DATABASE_PASSWORD = module.rds.password_ssm_parameter_name
    }
  )
  allowed_source_security_group_ids = [module.alb.security_group_id]
}

# バックエンド ECS から RDS へのインバウンド許可ルール (最小構成)
resource "aws_security_group_rule" "rds_from_backend" {
  type                     = "ingress"
  description              = "Allow backend ECS tasks to access RDS"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = module.rds.security_group_id
  source_security_group_id = module.ecs_backend.service_security_group_id
}

# 踏み台 (任意) から RDS へ接続するためのルール
resource "aws_security_group_rule" "rds_from_bastion" {
  count = var.create_bastion ? 1 : 0

  type                     = "ingress"
  description              = "Allow bastion EC2 to access RDS"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = module.rds.security_group_id
  source_security_group_id = module.bastion[0].security_group_id
}

# -----------------------------------------------------------------------------
# CDN (CloudFront) - DNS 設定は Cloudflare で実施
# -----------------------------------------------------------------------------

module "cloudfront" {
  source = "./modules/cloudfront"

  name_prefix = local.name_prefix
  domain_name = var.domain_name
  alternate_domain_names = compact([
    var.frontend_subdomain != "" ? "${var.frontend_subdomain}.${var.domain_name}" : null
  ])
  certificate_arn    = module.acm.cloudfront_certificate_arn
  origin_domain_name = module.alb.alb_dns_name
  api_path_pattern   = "/api/*"
}
