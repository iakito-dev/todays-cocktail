# ============================================
# backend/Dockerfile (GPT-5対応 / 最新gem対応)
# ============================================

# Ruby 3.3の公式イメージを使用
FROM ruby:3.3

# アプリケーションディレクトリを設定
WORKDIR /app

# 必要なパッケージをインストール
# - nodejs: アセット処理に必要
# - postgresql-client: PostgreSQLとの接続に必要
RUN apt-get update -qq && \
    apt-get install -y nodejs postgresql-client && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# ============================================
# Bundle設定：公式Rubygemsを明示
# ============================================
# これにより古いミラー環境でも最新の gem（openai >= 1.0.0）を取得できる
RUN bundle config set --local mirror.https://rubygems.org https://rubygems.org
RUN bundle config set --local path 'vendor/bundle'
RUN bundle config set --local retry '3'
RUN bundle config set --local jobs '4'

# Gemfileのみコピーして依存関係をインストール（キャッシュ最適化）
COPY Gemfile Gemfile.lock ./
RUN bundle install

# アプリケーションソースをコピー
COPY . .

# Railsポートを公開
EXPOSE 3000

# ============================================
# 起動コマンド
# ============================================
# データベース準備 → カクテル画像インポート → Rails起動
CMD ["bash", "-c", "bundle exec rails db:prepare && bundle exec rails cocktails:import_popular && bundle exec rails s -b 0.0.0.0"]
