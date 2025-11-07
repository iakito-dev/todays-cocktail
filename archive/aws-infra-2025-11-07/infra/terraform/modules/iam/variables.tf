# -----------------------------------------------------------------------------
# IAM モジュールで利用する入力変数
# -----------------------------------------------------------------------------

variable "name_prefix" {
  description = "リソース名プレフィックス"
  type        = string
}

variable "project_name" {
  description = "プロジェクト名"
  type        = string
}

variable "environment" {
  description = "環境名"
  type        = string
}

variable "allow_secrets" {
  description = "タスクから参照する SSM パラメータ名のリスト"
  type        = list(string)
  default     = []
}
