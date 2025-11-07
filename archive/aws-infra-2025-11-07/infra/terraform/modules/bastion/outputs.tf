output "instance_id" {
  description = "踏み台 EC2 インスタンスの ID"
  value       = aws_instance.this.id
}

output "security_group_id" {
  description = "踏み台が利用しているセキュリティグループ ID"
  value       = aws_security_group.this.id
}
