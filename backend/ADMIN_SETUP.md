# 管理者アカウント設定ガイド

## 個人開発用の管理者アカウント設定

このプロジェクトは個人開発用なので、管理者情報は`.env`ファイルに直接記載します。

### 1. .envファイルに管理者情報を設定

`backend/.env`ファイルに以下の情報を設定してください:

```bash
# 管理者アカウント設定
ADMIN_EMAIL=your-email@example.com
ADMIN_PASSWORD=your-secure-password
ADMIN_NAME=Your Name
```

**重要**:
- `.env`ファイルは`.gitignore`に含まれているため、Gitにコミットされません
- パスワードは十分に強力なものを設定してください
- メールアドレスは実際に使用可能なものを推奨します

### 2. 管理者アカウントを作成

環境変数を設定したら、以下のコマンドで管理者アカウントを作成します:

```bash
docker compose exec backend bin/rails admin:setup
```

### 3. 管理者権限の確認

作成された管理者アカウントを確認:

```bash
docker compose exec backend bin/rails admin:list
```

### その他の管理コマンド

```bash
# 既存ユーザーを管理者に昇格
docker compose exec backend bin/rails admin:promote[user@example.com]

# 管理者権限を削除
docker compose exec backend bin/rails admin:demote[user@example.com]
```

## セキュリティ注意事項

1. **本番環境では必ず強力なパスワードを使用**
2. **.envファイルを絶対にGitにコミットしない**（`.gitignore`で既に設定済み）
3. **定期的にパスワードを変更する**
4. **APIキーなどの機密情報も同様に.envで管理**

## 管理者機能

管理者アカウントでログインすると、以下の機能が使用可能になります:

- **カクテル情報の編集**: 詳細画面から編集ボタンが表示される
- **画像URLの手動設定**: 自動取得された画像を任意のURLで上書き可能
- **日本語名・作り方の編集**: 翻訳結果を手動で修正可能
