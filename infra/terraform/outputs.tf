# -----------------------------------------------------------------------------
# デプロイ後に確認したい代表的なアウトプット
# -----------------------------------------------------------------------------

output "vpc_id" {
  description = "作成された VPC の ID"
  value       = module.network.vpc_id
}

output "alb_dns_name" {
  description = "ALB の DNS 名"
  value       = module.alb.alb_dns_name
}

output "cloudfront_domain_name" {
  description = "CloudFront ディストリビューションのドメイン名"
  value       = module.cloudfront.distribution_domain_name
}

output "rds_endpoint" {
  description = "RDS エンドポイント (アプリケーション側の接続先)"
  value       = module.rds.db_endpoint
}

output "backend_secret_parameters" {
  description = "バックエンド環境変数に対応する SSM パラメータ名 (env var -> parameter)"
  value       = local.backend_secret_parameter_map
  sensitive   = true
}

output "bastion_instance_id" {
  description = "作成した踏み台 EC2 インスタンスの ID"
  value       = var.create_bastion ? module.bastion[0].instance_id : null
}
