locals {
  # エイリアスに利用するドメイン (Apex + 任意のサブドメイン) をまとめて正規化
  aliases = distinct(compact(concat([var.domain_name], var.alternate_domain_names)))
}

resource "aws_cloudfront_distribution" "this" {
  enabled             = true
  comment             = "${var.name_prefix} distribution"
  default_root_object = ""
  price_class         = "PriceClass_100" # 低コスト枠

  aliases = local.aliases

  # オリジンは東京リージョンの ALB を想定
  origin {
    domain_name = var.origin_domain_name
    origin_id   = "alb-origin"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # 静的アセット向けのデフォルトキャッシュ
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "alb-origin"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = true

      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 3600
    max_ttl     = 86400
  }

  # /api/* はキャッシュせず常にオリジンへ (API レスポンス向け)
  ordered_cache_behavior {
    path_pattern           = var.api_path_pattern
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = "alb-origin"
    viewer_protocol_policy = "https-only"
    compress               = true

    forwarded_values {
      query_string = true

      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = var.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
