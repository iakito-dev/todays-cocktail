output "db_endpoint" {
  description = "RDS エンドポイント (ホスト名:ポート)"
  value       = aws_db_instance.this.endpoint
}

output "db_instance_arn" {
  description = "RDS インスタンス ARN"
  value       = aws_db_instance.this.arn
}

output "db_instance_identifier" {
  description = "RDS インスタンス識別子"
  value       = aws_db_instance.this.id
}

output "security_group_id" {
  description = "RDS セキュリティグループ ID"
  value       = aws_security_group.db.id
}

output "password_ssm_parameter_name" {
  description = "格納した DB パスワードの SSM パラメータ名"
  value       = aws_ssm_parameter.db_password.name
}

