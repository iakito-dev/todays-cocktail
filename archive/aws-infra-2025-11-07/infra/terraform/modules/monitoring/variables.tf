variable "name_prefix" {
  description = "モニタリング用プレフィックス"
  type        = string
}

variable "sns_email" {
  description = "通知先メールアドレス"
  type        = string
}

variable "ecs_cluster_name" {
  description = "ECS クラスター名"
  type        = string
}

variable "ecs_service_names" {
  description = "監視対象 ECS サービス名のリスト"
  type        = list(string)
}

variable "alb_arn_suffix" {
  description = "ALB ARN サフィックス (CloudWatch メトリクス用)"
  type        = string
}

variable "rds_instance_identifier" {
  description = "RDS インスタンス識別子"
  type        = string
}

variable "cloudfront_distribution_id" {
  description = "CloudFront ディストリビューション ID"
  type        = string
}
