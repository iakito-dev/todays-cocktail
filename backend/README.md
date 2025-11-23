# Today's Cocktail Backend

カクテル情報を提供するRails APIバックエンド

## セットアップ

### 1. 依存関係のインストール

```bash
bundle install
```

### 2. 環境変数の設定

`.env.example`を参考に`.env`ファイルを作成してください。

```bash
cp .env.example .env
```

必須の環境変数:

- `DATABASE_URL`: PostgreSQLの接続URL
- `OPENAI_API_KEY`: OpenAI APIキー（カクテル情報の翻訳用）
- `ADMIN_EMAIL`: 管理者アカウントのメールアドレス
- `ADMIN_PASSWORD`: 管理者アカウントのパスワード
- `ADMIN_NAME`: 管理者アカウントの名前（オプション）

オプションの環境変数（メール配信用）:

- `RESEND_API_KEY`: Resend APIキー（メール配信に使用）
- `MAIL_FROM_ADDRESS`: 送信元メールアドレス
- `FRONTEND_URL`: フロントエンドURL（メール内リンク用）

**メール配信の設定**: 詳細は[RESEND_SETUP.md](./RESEND_SETUP.md)を参照してください。

### 3. データベースのセットアップ

```bash
bin/rails db:create
bin/rails db:migrate
```

### 4. 管理者アカウントの作成

環境変数で設定した情報を使って管理者アカウントを作成します。

```bash
bin/rails admin:setup
```

管理者アカウントの管理:

```bash
# 管理者一覧を表示
bin/rails admin:list

# 既存ユーザーを管理者に昇格
bin/rails admin:promote[user@example.com]

# 管理者権限を削除
bin/rails admin:demote[user@example.com]
```

### 5. カクテルデータのインポート

TheCocktailDB APIからカクテルデータをインポートし、日本語翻訳と画像をダウンロードします。

```bash
# すべてのカクテルをインポート（時間がかかります）
bin/rails cocktails:import

# 特定の文字で始まるカクテルをインポート
bin/rails cocktails:import_by_letter[a]

# 名前でカクテルを検索してインポート
bin/rails cocktails:import_by_name["Margarita"]
```

**注意**: インポート処理では以下が実行されます:

- カクテル名、材料名、分量、グラス名の日本語翻訳（OpenAI API使用）
- カクテル画像URLの取得と保存（Unsplash API使用）
- API負荷軽減のため、各カクテル間で0.5秒の待機時間あり

## 技術スタック

- Ruby 3.4.6
- Rails 8.0.3
- PostgreSQL 17（Supabase Cloud）
- Solid Cache（キャッシュ）
- Solid Queue（ジョブキュー）
- OpenAI API（翻訳・説明文生成）
- TheCocktailDB API（カクテルデータ取得）
- Unsplash API（画像取得）
- Resend API（メール送信）

## ディレクトリ構造

```
backend/
├── app/
│   ├── controllers/     # APIコントローラー
│   │   └── api/v1/      # v1 APIエンドポイント
│   ├── models/          # ActiveRecordモデル
│   ├── services/        # ビジネスロジック（サービスクラス）
│   ├── jobs/            # バックグラウンドジョブ（将来用）
│   ├── mailers/         # メール送信（Devise用）
│   └── views/           # メールテンプレート（Devise用）
├── config/              # 設定ファイル
│   ├── routes.rb         # ルーティング
│   ├── initializers/     # 初期化設定
│   └── environments/     # 環境別設定
├── db/                   # データベース関連
│   ├── migrate/          # マイグレーションファイル
│   └── schema.rb         # データベーススキーマ
├── lib/                  # ライブラリ・タスク
│   └── tasks/            # Rakeタスク
├── spec/                 # RSpecテスト
└── bin/                  # 実行可能スクリプト
```

## サービスクラス

### TranslationService

OpenAI APIを使用してカクテル関連のテキストを翻訳・生成します。

- `translate_cocktail_name(name)` - カクテル名を翻訳
- `translate_ingredient_name(name)` - 材料名を翻訳
- `translate_measure(measure)` - 分量を翻訳
- `translate_glass(glass)` - グラス名を翻訳
- `translate_instructions(instructions)` - 作り方を翻訳
- `generate_description(...)` - カクテル説明文を生成

### UnsplashImageService

Unsplash APIを使用してカクテル画像を検索・取得します。

- `fetch_and_attach_cocktail_image(cocktail)` - 画像を検索してURLを保存
- `batch_fetch_images(cocktails)` - 複数カクテルの画像を一括取得

## テストの実行

```bash
bundle exec rspec
```

## デプロイ

```bash
bin/kamal deploy
```
