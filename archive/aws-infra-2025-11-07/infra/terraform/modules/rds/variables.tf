variable "name_prefix" {
  description = "RDS リソース用プレフィックス"
  type        = string
}

variable "environment" {
  description = "環境名"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "subnet_ids" {
  description = "DB サブネットグループに含めるサブネット"
  type        = list(string)
  validation {
    condition     = length(var.subnet_ids) >= 1
    error_message = "サブネットは最低1つ必要です。"
  }
}

variable "db_name" {
  description = "初期データベース名"
  type        = string
}

variable "db_username" {
  description = "マスターユーザー名"
  type        = string
}

variable "db_password_ssm_parameter" {
  description = "生成したDBパスワードを保存する SSM パラメータ名"
  type        = string
}

variable "backup_retention" {
  description = "バックアップ保持日数"
  type        = number
  default     = 1
}

variable "engine" {
  description = "RDS エンジン"
  type        = string
  default     = "postgres"
}

variable "engine_version" {
  description = "RDS エンジンバージョン"
  type        = string
  default     = "17.4"
}

variable "instance_class" {
  description = "DB インスタンスクラス"
  type        = string
  default     = "db.t4g.micro"
}

variable "allocated_storage" {
  description = "割り当てストレージ (GB)"
  type        = number
  default     = 20
}
