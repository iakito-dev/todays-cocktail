data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

locals {
  # ECS タスクロール共通の信頼ポリシー
  ecs_assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "ecs-tasks.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })

  # タスクが参照できる SSM パラメータ ARN 一覧
  ssm_parameter_arns = [
    for name in var.allow_secrets :
    "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter/${name}"
  ]
}

# ECS タスク実行ロール (イメージ取得・ログ出力等の共通権限)
resource "aws_iam_role" "ecs_execution" {
  name               = "${var.name_prefix}-ecs-exec"
  assume_role_policy = local.ecs_assume_role_policy

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "ecs_execution_ssm" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess"
}

# フロントエンドタスク用ロール (現状は特別な権限なし)
resource "aws_iam_role" "frontend_task" {
  name               = "${var.name_prefix}-frontend-task"
  assume_role_policy = local.ecs_assume_role_policy

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# バックエンドタスク用ロール (DB パスワード取得など)
resource "aws_iam_role" "backend_task" {
  name               = "${var.name_prefix}-backend-task"
  assume_role_policy = local.ecs_assume_role_policy

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_iam_role_policy" "backend_ssm" {
  name = "${var.name_prefix}-backend-inline"
  role = aws_iam_role.backend_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ssm:GetParameter", "ssm:GetParameters", "ssm:GetParameterHistory"]
        Resource = local.ssm_parameter_arns
      }
    ]
  })
}
