variable "name_prefix" {
  description = "リソース名プレフィックス"
  type        = string
}

variable "vpc_id" {
  description = "対象 VPC の ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "ALB を配置するサブネット ID の一覧"
  type        = list(string)
}

variable "allow_cidrs_inbound" {
  description = "ALB に許可する CIDR"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "acm_listener_certificate_arn" {
  description = "HTTPS リスナーで利用する ACM 証明書 ARN"
  type        = string
}

variable "health_check_path_frontend" {
  description = "フロントエンドターゲットグループのヘルスチェックパス"
  type        = string
  default     = "/"
}

variable "health_check_path_backend" {
  description = "バックエンドターゲットグループのヘルスチェックパス"
  type        = string
  default     = "/api/health"
}

variable "frontend_target_port" {
  description = "フロントエンドターゲットグループのポート"
  type        = number
  default     = 3000
}

variable "backend_target_port" {
  description = "バックエンドターゲットグループのポート"
  type        = number
  default     = 8080
}
