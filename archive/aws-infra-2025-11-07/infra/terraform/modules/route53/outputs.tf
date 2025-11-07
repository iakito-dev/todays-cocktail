output "zone_id" {
  description = "作成した Route53 ホストゾーン ID"
  value       = aws_route53_zone.this.zone_id
}
