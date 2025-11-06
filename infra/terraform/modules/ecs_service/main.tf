# 呼び出し元で指定された環境変数・シークレットをコンテナ定義用に整形
data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

locals {
  environment = [
    for k, v in var.environment_variables :
    {
      name  = k
      value = v
    }
  ]

  secrets = [
    for k, v in var.secrets :
    {
      name      = k
      valueFrom = "arn:aws:ssm:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:parameter${v}"
    }
  ]
}

# CloudWatch Logs (awslogs ドライバ) 用ロググループ
resource "aws_cloudwatch_log_group" "this" {
  name              = "/ecs/${var.name_prefix}"
  retention_in_days = var.log_retention_in_days
}

# アプリケーションタスク用セキュリティグループ
resource "aws_security_group" "service" {
  name        = "${var.name_prefix}-sg"
  description = "Allow ALB ingress to ECS service"
  vpc_id      = var.vpc_id

  dynamic "ingress" {
    for_each = var.allowed_source_security_group_ids
    content {
      description     = "Ingress from ${ingress.value}"
      from_port       = var.container_port
      to_port         = var.container_port
      protocol        = "tcp"
      security_groups = [ingress.value]
    }
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.name_prefix}-sg"
  }
}

# タスク定義 (Fargate)
resource "aws_ecs_task_definition" "this" {
  family                   = var.name_prefix
  cpu                      = var.cpu
  memory                   = var.memory
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  container_definitions = jsonencode([
    {
      name      = var.name_prefix
      image     = var.container_image
      essential = true
      portMappings = [
        {
          containerPort = var.container_port
          hostPort      = var.container_port
          protocol      = "tcp"
        }
      ]
      environment = local.environment
      secrets     = local.secrets
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.this.name
          awslogs-region        = data.aws_region.current.name
          awslogs-stream-prefix = var.name_prefix
        }
      }
    }
  ])
}

# サービス定義 (ALB 連携, Public IP 付与)
resource "aws_ecs_service" "this" {
  name                              = var.name_prefix
  cluster                           = var.cluster_arn
  task_definition                   = aws_ecs_task_definition.this.arn
  desired_count                     = var.desired_count
  launch_type                       = "FARGATE"
  health_check_grace_period_seconds = var.health_check_grace_period
  enable_execute_command            = true

  network_configuration {
    assign_public_ip = var.assign_public_ip
    security_groups  = [aws_security_group.service.id]
    subnets          = var.subnet_ids
  }

  load_balancer {
    target_group_arn = var.target_group_arn
    container_name   = var.name_prefix
    container_port   = var.container_port
  }

  depends_on = [aws_cloudwatch_log_group.this]
}
