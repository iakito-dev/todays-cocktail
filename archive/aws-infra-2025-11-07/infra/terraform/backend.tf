terraform {
  backend "s3" {
    # NOTE: バケット名・キーは環境に合わせて事前に作成＆調整すること
    bucket         = "todays-cocktail-tf-state"
    key            = "envs/prod/terraform.tfstate"
    region         = "ap-northeast-1"
    dynamodb_table = "terraform-lock"
    encrypt        = true
  }
}
