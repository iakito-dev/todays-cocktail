# frontend/Dockerfile
# Node.js 22のAlpine Linuxイメージを使用（軽量化のため）
FROM node:22-alpine

# アプリケーションディレクトリを設定
WORKDIR /app

# bashを追加インストール（プロジェクトスクリプトがbashに依存するため）
RUN apk add --no-cache bash

# package.jsonとpackage-lock.jsonをコピー
# 依存関係のインストールを先に行うことでDockerキャッシュを効率化
COPY package*.json ./

# 依存関係をインストール
# npm ciを使用して本番環境と同じ依存関係をインストール
RUN npm ci

# アプリケーションのソースコードをコピー
COPY . .

# Viteの開発サーバーのポートを公開
EXPOSE 5173

# 開発サーバーを起動
# --host 0.0.0.0: 全IPアドレスからのアクセスを許可（Docker環境で必要）
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
