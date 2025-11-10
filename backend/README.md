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
- カクテル画像のダウンロードとActive Storageへの保存
- API負荷軽減のため、各カクテル間で0.5秒の待機時間あり

## 技術スタック

- Ruby 3.3.x
- Rails 8.0.x
- PostgreSQL
- Active Storage（画像保存）
- OpenAI API（翻訳）
- TheCocktailDB API（カクテルデータ取得）

## サービスクラス

### TranslationService

OpenAI APIを使用してカクテル関連のテキストを翻訳します。

- `translate_cocktail_name(name)` - カクテル名を翻訳
- `translate_ingredient_name(name)` - 材料名を翻訳
- `translate_measure(measure)` - 分量を翻訳
- `translate_glass(glass)` - グラス名を翻訳

### ImageDownloadService

外部URLから画像をダウンロードしてActive Storageに保存します。

- `download_and_attach(record, image_url)` - 画像をダウンロードしてアタッチ
- `batch_download(records)` - 複数レコードの画像を一括ダウンロード

## テストの実行

```bash
bundle exec rspec
```

## デプロイ

```bash
bin/kamal deploy
```
