# アプリケーション用ランダムパスワードを生成 (大文字・記号を含む)
resource "random_password" "master" {
  length           = 20
  special          = true
  override_special = "!#$%^&*()-_=+[]{}<>:?~'"
}

# 生成したパスワードを SSM Parameter Store (SecureString) に格納
resource "aws_ssm_parameter" "db_password" {
  name        = var.db_password_ssm_parameter
  description = "RDS master password for ${var.name_prefix}"
  type        = "SecureString"
  value       = random_password.master.result
}

# シングル AZ の DB サブネットグループ
resource "aws_db_subnet_group" "this" {
  name       = "${var.name_prefix}-db-subnet"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.name_prefix}-db-subnet"
  }
}

# RDS 用セキュリティグループ (インバウンドは呼び出し元で別途付与)
resource "aws_security_group" "db" {
  name        = "${var.name_prefix}-db-sg"
  description = "RDS private access security group"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-db-sg"
  }
}

# RDS for PostgreSQL 本体
resource "aws_db_instance" "this" {
  identifier                 = "${var.name_prefix}-db"
  engine                     = var.engine
  engine_version             = var.engine_version
  instance_class             = var.instance_class
  allocated_storage          = var.allocated_storage
  username                   = var.db_username
  password                   = random_password.master.result
  db_name                    = var.db_name
  db_subnet_group_name       = aws_db_subnet_group.this.name
  vpc_security_group_ids     = [aws_security_group.db.id]
  storage_type               = "gp3"
  backup_retention_period    = var.backup_retention
  publicly_accessible        = false
  multi_az                   = false
  deletion_protection        = false
  skip_final_snapshot        = false
  final_snapshot_identifier  = "${var.name_prefix}-final"
  auto_minor_version_upgrade = true
  apply_immediately          = false
  copy_tags_to_snapshot      = true
  maintenance_window         = "sun:18:00-sun:19:00"
  backup_window              = "19:00-20:00"
}
