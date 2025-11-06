# 東京リージョン (ALB 用) の証明書を DNS 検証で発行
resource "aws_acm_certificate" "alb" {
  domain_name               = var.domain_name
  subject_alternative_names = var.subject_alternative_names
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "alb" {
  certificate_arn = aws_acm_certificate.alb.arn
  validation_record_fqdns = [
    for dvo in aws_acm_certificate.alb.domain_validation_options :
    dvo.resource_record_name
  ]
}

# us-east-1 (CloudFront 用) の証明書を DNS 検証で発行
resource "aws_acm_certificate" "cloudfront" {
  provider                  = aws.us_east_1
  domain_name               = var.domain_name
  subject_alternative_names = var.subject_alternative_names
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_acm_certificate_validation" "cloudfront" {
  provider        = aws.us_east_1
  certificate_arn = aws_acm_certificate.cloudfront.arn
  validation_record_fqdns = [
    for dvo in aws_acm_certificate.cloudfront.domain_validation_options :
    dvo.resource_record_name
  ]
}
