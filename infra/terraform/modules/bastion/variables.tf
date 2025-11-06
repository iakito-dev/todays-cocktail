variable "name_prefix" {
  description = "プロジェクト名と環境を組み合わせたプレフィックス"
  type        = string
}

variable "project_name" {
  description = "プロジェクト識別用の名前"
  type        = string
}

variable "environment" {
  description = "環境名 (prod / staging など)"
  type        = string
}

variable "vpc_id" {
  description = "配置先 VPC の ID"
  type        = string
}

variable "subnet_id" {
  description = "踏み台を配置するサブネット ID (通常はパブリックサブネット)"
  type        = string
}

variable "instance_type" {
  description = "踏み台 EC2 インスタンスタイプ"
  type        = string
  default     = "t4g.nano"
}

variable "default_tags" {
  description = "共通で付与するタグ"
  type        = map(string)
  default     = {}
}
