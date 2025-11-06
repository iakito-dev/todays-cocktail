variable "name_prefix" {
  description = "ECS サービスのベース名"
  type        = string
}

variable "cluster_name" {
  description = "ECS クラスター名"
  type        = string
}

variable "cluster_arn" {
  description = "ECS クラスター ARN"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID (セキュリティグループ作成用)"
  type        = string
}

variable "subnet_ids" {
  description = "タスクを配置するサブネット"
  type        = list(string)
}

variable "assign_public_ip" {
  description = "タスクにパブリックIPを付与するか"
  type        = bool
  default     = true
}

variable "container_image" {
  description = "デプロイするコンテナイメージ"
  type        = string
}

variable "container_port" {
  description = "コンテナのリスニングポート"
  type        = number
}

variable "desired_count" {
  description = "サービスの希望タスク数"
  type        = number
  default     = 1
}

variable "cpu" {
  description = "タスク全体の vCPU (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "memory" {
  description = "タスク全体のメモリ (MB)"
  type        = number
  default     = 1024
}

variable "execution_role_arn" {
  description = "ECS タスク実行ロール ARN"
  type        = string
}

variable "task_role_arn" {
  description = "ECS タスクロール ARN"
  type        = string
}

variable "target_group_arn" {
  description = "ALB ターゲットグループ ARN"
  type        = string
}

variable "log_retention_in_days" {
  description = "CloudWatch Logs 保持日数"
  type        = number
  default     = 7
}

variable "health_check_grace_period" {
  description = "ヘルスチェック猶予 (秒)"
  type        = number
  default     = 60
}

variable "environment_variables" {
  description = "コンテナに渡す環境変数"
  type        = map(string)
  default     = {}
}

variable "secrets" {
  description = "コンテナに渡すシークレット (name -> SSM パラメータ名)"
  type        = map(string)
  default     = {}
}

variable "allowed_source_security_group_ids" {
  description = "このサービスへのインバウンドを許可するセキュリティグループID"
  type        = list(string)
  default     = []
}
