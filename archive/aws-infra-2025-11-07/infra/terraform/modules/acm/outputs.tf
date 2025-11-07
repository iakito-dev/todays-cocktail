output "alb_certificate_arn" {
  description = "東京リージョン (ALB 用) の ACM 証明書 ARN"
  value       = aws_acm_certificate_validation.alb.certificate_arn
}

output "cloudfront_certificate_arn" {
  description = "us-east-1 (CloudFront 用) の ACM 証明書 ARN"
  value       = aws_acm_certificate_validation.cloudfront.certificate_arn
}

output "alb_validation_records" {
  description = "ALB 用証明書の DNS 検証レコード一覧"
  value = [
    for dvo in aws_acm_certificate.alb.domain_validation_options :
    {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  ]
}

output "cloudfront_validation_records" {
  description = "CloudFront 用証明書の DNS 検証レコード一覧"
  value = [
    for dvo in aws_acm_certificate.cloudfront.domain_validation_options :
    {
      name  = dvo.resource_record_name
      type  = dvo.resource_record_type
      value = dvo.resource_record_value
    }
  ]
}
