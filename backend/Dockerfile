# backend/Dockerfile
# Ruby 3.3の公式イメージを使用
FROM ruby:3.3

# アプリケーションディレクトリを設定
WORKDIR /app

# 必要なパッケージをインストール
# - nodejs: アセット処理に必要
# - postgresql-client: PostgreSQLデータベースとの接続に必要
RUN apt-get update -qq && \
    apt-get install -y nodejs postgresql-client && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Gemfileを先にコピーして依存関係をインストール
# これによりDockerのキャッシュを効率的に利用可能
COPY Gemfile Gemfile.lock ./
RUN bundle install

# アプリケーションのソースコードをコピー
COPY . .

# Railsアプリケーションのポートを公開
EXPOSE 3000

# データベースの準備、画像インポート、サーバー起動
# - db:prepare: データベースの作成とマイグレーション
# - cocktails:import_popular: カクテル画像のインポート
# - rails s -b 0.0.0.0: 全IPアドレスからのアクセスを許可
CMD ["bash", "-c", "bundle exec rails db:prepare && bundle exec rails cocktails:import_popular && bundle exec rails s -b 0.0.0.0"]
