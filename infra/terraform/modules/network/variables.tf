# 入力パラメータ
variable "name_prefix" {
  description = "リソース名プレフィックス"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR"
  type        = string
}

variable "availability_zones" {
  description = "利用するアベイラビリティゾーン一覧"
  type        = list(string)
}

variable "public_subnet_cidrs" {
  description = "パブリックサブネット CIDR 一覧"
  type        = list(string)
  validation {
    condition     = length(var.public_subnet_cidrs) == length(var.availability_zones)
    error_message = "public_subnet_cidrs と availability_zones の要素数を一致させてください。"
  }
}

variable "private_subnet_cidrs" {
  description = "プライベートサブネット CIDR 一覧"
  type        = list(string)
  validation {
    condition     = length(var.private_subnet_cidrs) == length(var.availability_zones)
    error_message = "private_subnet_cidrs と availability_zones の要素数を一致させてください。"
  }
}
