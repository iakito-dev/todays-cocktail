variable "name_prefix" {
  description = "CloudFront ディストリビューション用の名前プレフィックス"
  type        = string
}

variable "domain_name" {
  description = "配信するカスタムドメイン (Apex)"
  type        = string
}

variable "alternate_domain_names" {
  description = "追加で関連付けるカスタムドメイン"
  type        = list(string)
  default     = []
}

variable "certificate_arn" {
  description = "ACM 証明書 (us-east-1)"
  type        = string
}

variable "origin_domain_name" {
  description = "オリジン (ALB) のドメイン"
  type        = string
}

variable "api_path_pattern" {
  description = "API 用のパスパターン"
  type        = string
  default     = "/api/*"
}
