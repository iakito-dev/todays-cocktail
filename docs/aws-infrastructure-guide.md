# <project-name> AWS インフラ構築・運用ガイド

このドキュメントは backend/frontend を AWS 上で動かすための手順を、初期構築から運用まで時系列で整理したものです。Cloudflare 側でドメインを管理し続ける前提です。

---

## 0. 必要なもの
- AWS CLI / Terraform CLI (>=1.6) / Docker CLI
- AWS アカウント ID（例: `<AWS_ACCOUNT_ID>`）
- Cloudflare で管理しているドメイン（例: `<example.com>`）
- GitHub リポジトリ（例: `<org-or-user>/<repository>`）

---

## 1. Terraform 環境の準備
1. `infra/terraform/envs/<env>/backend-secrets.auto.tfvars.example` をコピーし、`backend-secrets.auto.tfvars` を作成。既存環境で使用している機密値（例: `ADMIN_PASSWORD`, `DATABASE_URL`, API キーなど）を `backend_secret_values` に記入する（Git 管理外）。
2. `infra/terraform/envs/<env>/terraform.tfvars` を開き、非機密の環境変数・サブネット CIDR・ECR イメージ URI を調整（API ドメインが確定していない場合は TODO のままで OK）。
3. Terraform backend 用の S3 バケット `<tf-state-bucket>` と DynamoDB `<tf-lock-table>` があるか確認。バージョニングを有効にしておくと復旧が容易。

---

## 2. 依存リソース（ECR）の作成と Docker イメージの push
1. **ECR リポジトリ作成**
   ```bash
   aws ecr create-repository \
     --repository-name <frontend-repo-name> \
     --image-scanning-configuration scanOnPush=true \
     --region <aws-region>

   aws ecr create-repository \
     --repository-name <backend-repo-name> \
     --image-scanning-configuration scanOnPush=true \
     --region <aws-region>
   ```
2. **ECR へログイン & 初回 push**

   ```bash
   aws ecr get-login-password --region <aws-region> \
     | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.<aws-region>.amazonaws.com
   ```

   **Frontend**

   ```bash
   cd frontend
   docker buildx build \
     --platform linux/amd64 \
     -t <frontend-repo-name> .
   docker tag <frontend-repo-name>:latest \
     <AWS_ACCOUNT_ID>.dkr.ecr.<aws-region>.amazonaws.com/<frontend-repo-name>:latest
   docker push <AWS_ACCOUNT_ID>.dkr.ecr.<aws-region>.amazonaws.com/<frontend-repo-name>:latest
   ```

   **Backend**

   ```bash
   cd ../backend
   docker buildx build \
     --platform linux/amd64 \
     -t <backend-repo-name> .
   docker tag <backend-repo-name>:latest \
     <AWS_ACCOUNT_ID>.dkr.ecr.<aws-region>.amazonaws.com/<backend-repo-name>:latest
   docker push <AWS_ACCOUNT_ID>.dkr.ecr.<aws-region>.amazonaws.com/<backend-repo-name>:latest
  ```
   GitHub Actions の `deploy.yml` でも push するが、初回は手動で最新イメージを上げておく。

---

## 3. Terraform の実行
1. **初期化**
   ```bash
   cd infra/terraform
   terraform init
   ```
2. **plan**
   ```bash
   terraform plan -var-file=envs/<env>/terraform.tfvars
   ```
   - 初回 plan で `alb_validation_records` / `cloudfront_validation_records` が表示される。ACM の CNAME を Cloudflare の DNS に追加し、証明書が「発行済み」になるまで待つ（東京・us-east-1 の両方）。
3. **apply**
   ```bash
   terraform apply -var-file=envs/<env>/terraform.tfvars
   ```
   - 途中で止めず完了まで待つ。VPC の再作成や RDS の作成は10〜20分かかる場合がある。
4. **出力確認**
   ```bash
   terraform output
   ```
   - `alb_dns_name`, `cloudfront_domain_name`, `backend_secret_parameters` などを控えておく。
5. **Cloudflare DNS 設定**
   - `<root-domain>`（Apex） → CloudFront
   - `<api-subdomain>.<root-domain>` → ALB（または CloudFront）  
   - ACM 用 CNAME はそのまま保持する。

---

## 4. GitHub Actions の設定
- リポジトリ設定 → Secrets and Variables → Actions に必要な値を登録（例：ビルド専用の `VITE_API_BASE_URL`）。
- `terraform-plan.yml`: PR 作成時に `terraform plan` を実行し PR コメントへ投稿。
- `deploy.yml`: main への push で Docker イメージを ECR に push → `terraform apply` → `ecs update-service` を自動実行。
  （自動 apply を止めたい場合は Environment 保護ルールや手動トリガーに変更する）

---

## 5. 運用フロー
| タイミング | 作業 |
| --- | --- |
| 設定変更時 | `frontend_environment` や `backend_environment` を変更 → `terraform apply`。 |
| 機密値更新 | `backend-secrets.auto.tfvars` を更新 → `terraform apply`（Parameter Store へ反映）。 |
| デプロイ | GitHub Actions `deploy` を走らせるか、手動で Docker build & push → `aws ecs update-service --force-new-deployment`。 |
| DNS/証明書 | Cloudflare DNS を更新し、ACM が期限切れになる前に `terraform apply` で再発行を確認。 |
| トラブルシュート | `terraform output` と AWS コンソールを照らし合わせ、必要に応じて `terraform state list/show` で状態を確認。 |

---

## 6. Tips
- **ACM + Cloudflare**: Route53 なしでも利用可。CNAME を Cloudflare に登録すれば発行される。失効前に `terraform apply` を実行しておけば自動更新される。
- **Parameter Store**:
  ```bash
  aws ssm get-parameter --name /<project-name>/<env>/backend/SECRET_KEY_BASE --with-decryption
  ```  
  で中身を確認できる（IAM 権限が必要）。`DATABASE_URL` など `backend_secret_values` に追加した項目も同様に参照できる。
- **State のバージョニング**: S3 バケットのバージョニングが有効なので、万一のときは以前の state を復元できる。
- **ECR イメージのタグ**: `latest` と Git SHA を両方付けるとロールバックしやすい。GitHub Actions もこの構成。
- **複数 AZ**: 今回の VPC は `ap-northeast-1a` と `1c` の 2AZ で構成。CIDR を変更する場合は `availability_zones` / `public_subnet_cidrs` / `private_subnet_cidrs` の要素数を揃える。

---

## 7. 今後の拡張アイデア
- CloudWatch アラーム → SNS → Slack/Lambda 通知連携。
- Secrets Manager で機密情報の自動ローテーション。
- Cloudflare Terraform Provider を導入し、DNS も IaC 化。
- Terraform Cloud / Remote Execution で state 操作を共有環境に移行。

---

これらを順に実行すれば、Cloudflare 管理のまま AWS 上でアプリを構築・運用できます。疑問点があれば随時このドキュメントに追記してください。
