output "service_name" {
  description = "作成した ECS サービス名"
  value       = aws_ecs_service.this.name
}

output "service_security_group_id" {
  description = "ECS サービス用セキュリティグループ ID"
  value       = aws_security_group.service.id
}

output "task_definition_arn" {
  description = "登録されたタスク定義 ARN"
  value       = aws_ecs_task_definition.this.arn
}

output "cluster_name" {
  description = "サービスが属するクラスター名"
  value       = var.cluster_name
}
