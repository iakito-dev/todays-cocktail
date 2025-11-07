output "vpc_id" {
  description = "作成した VPC の ID"
  value       = aws_vpc.this.id
}

output "public_subnet_ids" {
  description = "パブリックサブネット ID の一覧"
  value       = [for subnet in aws_subnet.public : subnet.id]
}

output "private_subnet_ids" {
  description = "プライベートサブネット ID の一覧"
  value       = [for subnet in aws_subnet.private : subnet.id]
}
