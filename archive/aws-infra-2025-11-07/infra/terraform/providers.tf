# -----------------------------------------------------------------------------
# プロバイダー設定
# 東京リージョンをデフォルト、us-east-1 は CloudFront 用 ACM 発行に利用
# -----------------------------------------------------------------------------

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = var.default_tags
  }
}

provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"

  default_tags {
    tags = var.default_tags
  }
}

# デバッグや追加設定時に参照できるようアカウント情報も取得
data "aws_caller_identity" "current" {}

data "aws_region" "current" {
  provider = aws
}
