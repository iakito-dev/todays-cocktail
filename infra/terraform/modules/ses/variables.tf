variable "domain_name" {
  description = "SES 検証用ドメイン"
  type        = string
}

variable "notification_email" {
  description = "死活監視メールの送信・受信に利用するメールアドレス"
  type        = string
}

variable "zone_id" {
  description = "Route53 ホストゾーン ID"
  type        = string
}

