output "domain_identity_arn" {
  value = aws_ses_domain_identity.this.arn
}

output "email_identity_arn" {
  value = aws_ses_email_identity.notification.arn
}

