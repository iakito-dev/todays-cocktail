resource "aws_route53_zone" "this" {
  # ルートドメインを管理するパブリックホストゾーン
  name = var.domain_name
}
