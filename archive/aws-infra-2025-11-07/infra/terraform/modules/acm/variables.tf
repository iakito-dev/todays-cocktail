variable "domain_name" {
  description = "メインドメイン"
  type        = string
}

variable "subject_alternative_names" {
  description = "SANs として追加するドメインのリスト"
  type        = list(string)
  default     = []
}

