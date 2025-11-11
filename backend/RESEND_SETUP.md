# Resend メール配信設定ガイド

## Resendとは

Resendは、開発者向けのモダンなメール配信サービスです。シンプルなAPI、優れた配信性能、無料プランでも十分な送信量（月100通）が特徴です。

## セットアップ手順

### 1. Resendアカウントの作成

1. [Resend](https://resend.com/)にアクセス
2. GitHubアカウントでサインアップ（または通常のサインアップ）
3. 無料プランで開始

### 2. API Keyの取得

1. Resendダッシュボードにログイン
2. 左メニューから **API Keys** をクリック
3. **Create API Key** をクリック
4. 名前を入力（例: `todays-cocktail-dev`）
5. **Permissions** は `Sending access` を選択
6. API Keyをコピー（**一度しか表示されないので必ず保存してください！**）

### 3. ドメインまたはメールアドレスの認証

#### オプションA: 独自ドメインを使用する場合（推奨）

1. Resendダッシュボードで **Domains** をクリック
2. **Add Domain** をクリック
3. ドメイン名を入力（例: `yourdomain.com`）
4. 表示されるDNSレコードをドメインのDNS設定に追加
   - SPF、DKIM、DMARCレコード
5. 認証が完了するまで待つ（通常数分〜数時間）

#### オプションB: 開発・テスト用（簡単）

Resendの無料プランでは、認証なしで以下のアドレスから送信できます：

- `onboarding@resend.dev`（デフォルト）

ただし、本番環境では必ず独自ドメインを認証してください。

### 4. 環境変数の設定

`backend/.env`ファイルに以下を追加：

```bash
# Resend API Key
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# 送信元メールアドレス
# 独自ドメインを認証した場合
MAIL_FROM_ADDRESS=noreply@yourdomain.com
# または、開発環境用
# MAIL_FROM_ADDRESS=onboarding@resend.dev

# フロントエンドのURL（メール内のリンクに使用）
FRONTEND_URL=http://localhost:5173
```

**注意**: `.env`ファイルはGitにコミットされません。本番環境では適切な方法で環境変数を設定してください。

### 5. 動作確認

#### 開発環境でテスト

```bash
# バックエンドを再起動
docker compose restart backend

# テストユーザーを作成してメール送信
docker compose exec backend bin/rails runner "
user = User.create!(
  email: 'your-email@example.com',  # あなたの実際のメールアドレス
  password: 'password123',
  name: 'テストユーザー'
)
puts ' 確認メールを送信しました: ' + user.email
"
```

数分以内にメールが届くはずです。届かない場合は、スパムフォルダも確認してください。

#### letter_openerに戻す

環境変数`RESEND_API_KEY`を削除またはコメントアウトすると、自動的に`letter_opener`（ファイルベース）に戻ります。

```bash
# .envファイル内
# RESEND_API_KEY=re_xxx...  # コメントアウト
```

### 6. 本番環境への展開

#### Kamalでのデプロイ

`config/deploy.yml`に環境変数を追加：

```yaml
env:
  secret:
    - RESEND_API_KEY
    - MAIL_FROM_ADDRESS
  clear:
    FRONTEND_URL: https://yourdomain.com
```

環境変数を設定：

```bash
# ホスト側で環境変数を設定
kamal env push RESEND_API_KEY=re_xxx...
kamal env push MAIL_FROM_ADDRESS=noreply@yourdomain.com
```

## トラブルシューティング

### メールが届かない

1. **API Keyが正しいか確認**

   ```bash
   docker compose exec backend bin/rails runner "puts ENV['RESEND_API_KEY']"
   ```

2. **送信元アドレスが認証されているか確認**
   - Resendダッシュボードの **Domains** で認証状態を確認

3. **スパムフォルダを確認**

4. **Resendのログを確認**
   - Resendダッシュボードの **Emails** で送信履歴を確認

### 迷惑メールに入る/配信評価が低い

1. **送信元ドメインの一貫性**
   - `MAIL_FROM_ADDRESS` と Resend で認証したドメインを必ず一致させる（例: `noreply@todays-cocktail.app`）。
   - Devise の `mailer_sender`／`ApplicationMailer` も同じアドレスを参照するようにしたので、`.env` に正しい値をセットする。
2. **DNS レコードの整備**
   - SPF: `v=spf1 include:resend.net ~all`
   - DKIM: Resend が提示する3つの CNAME を追加
   - DMARC: `v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com`
3. **コンテンツの改善**
   - テキスト版（`confirmation_instructions.text.erb`）を残す、短縮URLを使わない、挨拶→目的→アクション→サポートの構成を守る。
4. **レピュテーションの育成**
   - 新しいドメインは 1 日 10–20 通程度から送り、配信エラー < 2%、スパム苦情 < 0.1% を維持。
   - Resend の [Emails] 画面でバウンス/ブロック理由を週次で確認。
5. **受信者サイン**
   - 連絡先に受信許可（ホワイトリスト）を依頼し、アプリの UI に「確認メールが届かない場合は迷惑メールを確認」と明記。

### エラーメッセージの確認

```bash
# Railsログを確認
docker compose logs backend | grep -i mail
```

## 料金プラン

### 無料プラン

- 月100通まで無料
- 独自ドメイン使用可能
- API Key無制限

### Proプラン（$20/月）

- 月50,000通
- 追加で1,000通あたり$1

個人開発や小規模アプリケーションなら無料プランで十分です。

## 参考リンク

- [Resend公式ドキュメント](https://resend.com/docs)
- [ResendのSMTP設定](https://resend.com/docs/send-with-smtp)
- [Resendダッシュボード](https://resend.com/emails)
