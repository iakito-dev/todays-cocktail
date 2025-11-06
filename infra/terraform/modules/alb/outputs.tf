output "alb_arn" {
  description = "ALB の ARN"
  value       = aws_lb.this.arn
}

output "alb_arn_suffix" {
  description = "CloudWatch 等で利用する ARN サフィックス"
  value       = aws_lb.this.arn_suffix
}

output "alb_dns_name" {
  description = "ALB の DNS 名"
  value       = aws_lb.this.dns_name
}

output "alb_zone_id" {
  description = "ALB の HostedZone ID (Route53 エイリアスに必要)"
  value       = aws_lb.this.zone_id
}

output "security_group_id" {
  description = "ALB 用セキュリティグループ ID"
  value       = aws_security_group.alb.id
}

output "frontend_target_group_arn" {
  description = "フロントエンドターゲットグループ ARN"
  value       = aws_lb_target_group.frontend.arn
}

output "backend_target_group_arn" {
  description = "バックエンドターゲットグループ ARN"
  value       = aws_lb_target_group.backend.arn
}
