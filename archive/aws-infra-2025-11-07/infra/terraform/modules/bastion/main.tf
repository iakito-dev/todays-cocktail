# -----------------------------------------------------------------------------
# Session Manager 経由で RDS などに接続する踏み台 EC2 インスタンス
# -----------------------------------------------------------------------------

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

# 最新の Amazon Linux 2023 (ARM64) AMI ID を SSM パラメータから取得
# Session Manager エージェントがプリインストールされた標準イメージを利用
data "aws_ssm_parameter" "al2023_arm64" {
  name = "/aws/service/ami-amazon-linux-latest/al2023-ami-kernel-6.1-arm64"
}

# インバウンドは受け付けず、アウトバウンドのみ許可するセキュリティグループ
resource "aws_security_group" "this" {
  name        = "${var.name_prefix}-bastion-sg"
  description = "Session Manager bastion security group"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge({
    Name = "${var.name_prefix}-bastion-sg"
  }, var.default_tags)
}

# Session Manager を利用するための IAM ロール
resource "aws_iam_role" "this" {
  name = "${var.name_prefix}-bastion-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ec2.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  tags = var.default_tags
}

resource "aws_iam_role_policy_attachment" "ssm" {
  role       = aws_iam_role.this.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "this" {
  name = "${var.name_prefix}-bastion-profile"
  role = aws_iam_role.this.name
}

# 踏み台 EC2 インスタンス (Session Manager 経由で利用)
resource "aws_instance" "this" {
  ami                         = data.aws_ssm_parameter.al2023_arm64.value
  instance_type               = var.instance_type
  subnet_id                   = var.subnet_id
  associate_public_ip_address = true
  iam_instance_profile        = aws_iam_instance_profile.this.name
  vpc_security_group_ids      = [aws_security_group.this.id]

  user_data = <<-EOF
#!/bin/bash
set -euo pipefail
dnf update -y
dnf install -y amazon-ssm-agent
systemctl enable amazon-ssm-agent
systemctl restart amazon-ssm-agent
EOF

  root_block_device {
    volume_size = 10
    volume_type = "gp3"
  }

  metadata_options {
    http_endpoint               = "enabled"
    http_put_response_hop_limit = 2
    http_tokens                 = "required"
  }

  tags = merge({
    Name = "${var.name_prefix}-bastion"
  }, var.default_tags)
}
