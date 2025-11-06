output "ecs_execution_role_arn" {
  description = "ECS タスク実行ロール ARN"
  value       = aws_iam_role.ecs_execution.arn
}

output "frontend_task_role_arn" {
  description = "フロントエンドタスクロール ARN"
  value       = aws_iam_role.frontend_task.arn
}

output "backend_task_role_arn" {
  description = "バックエンドタスクロール ARN"
  value       = aws_iam_role.backend_task.arn
}

output "db_password_ssm_parameter_name" {
  description = "タスクが参照する SSM パラメータ名 (先頭要素を想定)"
  value       = try(var.allow_secrets[0], null)
}
