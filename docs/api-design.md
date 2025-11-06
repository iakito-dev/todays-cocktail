# API設計書（Today’s Cocktail）

バージョン: v1
ベースURL: `/api/v1`
最終更新: 2025-11-06

---

## 1. 概要

Today’s Cocktail のバックエンドは Ruby on Rails (API モード) で構築されており、フロントエンド（React）と通信するための JSON API を提供する。本書では現状の実装と突き合わせながら、エンドポイントの入出力・バリデーション・認証要件を整理する。

---

## 2. 認証と共通仕様

### 2.1 認証方式（JWT）
1. **サインアップ**: `POST /api/v1/signup` でアカウント作成。成功時は確認メールが送信され、レスポンスヘッダー `Authorization` に暫定トークンが付与される。
2. **メール確認**: 受信メールのリンク（`GET /api/v1/confirmation?confirmation_token=...`）を踏む。成功するとアカウントが確認済みとなり、新しい JWT がヘッダーに付与される。
3. **ログイン**: `POST /api/v1/login` で JWT を取得。以降 24 時間（`jwt.expiration_time = 1.day`）有効。
4. **認証付きリクエスト**: `Authorization: Bearer <JWT>` をヘッダーに付与してアクセス。
5. **ログアウト**: `DELETE /api/v1/logout` でトークンを失効リスト（`jwt_denylists`）に登録。以降同じトークンではアクセス不可。

> ※ トークンは `Authorization` レスポンスヘッダーに付与される。フロントエンド側で保存（例: HTTP-only Cookie やメモリ）し、以降のリクエストで `Bearer` 形式で送信する。

### 2.2 共通ヘッダー
- 送信時: `Content-Type: application/json`, `Accept: application/json`
- 認証必須エンドポイント: `Authorization: Bearer <JWT>`

### 2.3 標準レスポンス構造
- 認証・ユーザー・お気に入り系: 下記のように `status` オブジェクトと `data`/`errors` を返す。
  ```json
  {
    "status": { "code": 200, "message": "..." },
    "data": { ... },
    "errors": ["..."] // 失敗時のみ
  }
  ```
- カクテル系: 配列またはオブジェクトを直接返す（`status` ラッパーなし）。
- タイムスタンプ: ISO 8601 形式（例: `2025-11-06T12:34:56Z`）。
- 未認証アクセス: `401` + `{"error": "認証が必要です。ログインしてください。"}`。

### 2.4 主要ステータスコード
- `200 OK` / `201 Created`: 正常完了。
- `401 Unauthorized`: JWT 不足・不正。
- `403 Forbidden`: 管理者権限不足。
- `404 Not Found`: 対象リソース無し。
- `422 Unprocessable Entity`: バリデーションエラー。
- `500 Internal Server Error`: 予期せぬエラー。

---

## 3. エンドポイント仕様

### 3.1 認証系エンドポイント

#### POST /api/v1/signup
- **認証**: 不要
- **目的**: 新規ユーザー作成（確認メール送信）
- **リクエストボディ**
  ```json
  {
    "user": {
      "email": "newuser@example.com",
      "password": "password123",
      "password_confirmation": "password123",
      "name": "新規ユーザー"
    }
  }
  ```
- **バリデーション**
  - `email`: Devise により必須・一意・メール形式。
  - `password`: 6 文字以上、`password_confirmation` と一致。
  - `name`: 任意（未入力可）。
- **成功レスポンス 200**
  ```json
  {
    "status": {
      "code": 200,
      "message": "確認メールを送信しました。メールを確認してアカウントを有効化してください。"
    },
    "data": {
      "user": {
        "id": 12,
        "email": "newuser@example.com",
        "name": "新規ユーザー",
        "confirmed": false
      }
    }
  }
  ```
  - ヘッダー: `Authorization: Bearer <JWT>`
- **失敗例 422**
  ```json
  {
    "status": { "code": 422, "message": "アカウントの作成に失敗しました。" },
    "errors": [
      "Password confirmation doesn't match Password"
    ]
  }
  ```

#### GET /api/v1/confirmation
- **認証**: 不要（メール内リンク経由）
- **クエリパラメータ**: `confirmation_token`（メールに記載）
- **処理**: ユーザーを確認済みにし、自動でサインイン（JWT 発行）
- **成功レスポンス 200**
  ```json
  {
    "status": { "code": 200, "message": "メールアドレスが確認されました。" },
    "data": {
      "user": {
        "id": 12,
        "email": "newuser@example.com",
        "name": "新規ユーザー",
        "confirmed": true,
        "admin": false
      }
    }
  }
  ```
  - ヘッダー: `Authorization: Bearer <JWT>`
- **失敗レスポンス 422**
  ```json
  {
    "status": { "code": 422, "message": "確認トークンが無効です。" },
    "errors": ["Confirmation token is invalid"]
  }
  ```

#### POST /api/v1/confirmation
- **認証**: 不要
- **目的**: 確認メールの再送依頼
- **リクエストボディ**
  ```json
  { "user": { "email": "user@example.com" } }
  ```
- **レスポンス**
  - 成功 200: `"status.message": "確認メールを再送信しました。"`
  - 失敗 422: `errors` に原因（未登録メールなど）。

#### POST /api/v1/login
- **認証**: 不要
- **リクエストボディ**
  ```json
  {
    "user": { "email": "user@example.com", "password": "password123" }
  }
  ```
- **成功レスポンス 200**
  ```json
  {
    "status": { "code": 200, "message": "ログインに成功しました。" },
    "data": {
      "user": {
        "id": 7,
        "email": "user@example.com",
        "name": "ユーザー名",
        "admin": false
      }
    }
  }
  ```
  - ヘッダー: `Authorization: Bearer <JWT>`
- **失敗レスポンス 401**
  ```json
  {
    "status": { "code": 401, "message": "メールアドレスまたはパスワードが正しくありません。" },
    "errors": ["認証に失敗しました"]
  }
  ```
  - 未確認ユーザーの場合も 401。
- **失敗レスポンス 500**: 内部例外発生時。`errors` に例外メッセージ。

#### DELETE /api/v1/logout
- **認証**: 推奨（トークンなしでも 200 を返す設計）
- **処理**: トークンを失効リストに登録。以降同トークンでのアクセスは 401。
- **レスポンス 200**
  ```json
  { "status": { "code": 200, "message": "ログアウトしました。" } }
  ```
- **トークンが不正/期限切れ**: 同じく 200（仕様上エラーとしない）。

#### GET /api/v1/users/me
- **認証**: 必須
- **目的**: 現在ログイン中ユーザー情報の取得
- **レスポンス 200**
  ```json
  {
    "status": { "code": 200, "message": "ユーザー情報を取得しました。" },
    "data": {
      "user": {
        "id": 7,
        "email": "user@example.com",
        "name": "ユーザー名",
        "admin": false
      }
    }
  }
  ```

---

### 3.2 カクテルエンドポイント

#### GET /api/v1/cocktails
- **認証**: 不要
- **目的**: カクテル一覧・検索
- **クエリパラメータ**

| パラメータ | 型 | 必須 | デフォルト | 説明 |
| --- | --- | --- | --- | --- |
| `q` | string | 任意 | なし | `name` または `name_ja` の部分一致検索。前後空白は無視。 |
| `base` | string / string[] | 任意 | なし | ベース種別。複数指定可（配列またはカンマ区切り）。有効値: `gin`, `rum`, `whisky`, `vodka`, `tequila`, `beer`, `wine`. 無効値は無視される。 |
| `ingredients` | string | 任意 | なし | 材料キーワード。カンマ/空白/読点区切りで複数指定。すべての語が `instructions` に含まれるカクテルを返す。 |
| `page` | integer | 任意 | 1 | 1 始まり。負数は 1 として扱う。 |
| `per_page` | integer | 任意 | 9 | 1〜100 の範囲。範囲外は切り詰め。 |
| `sort` | string | 任意 | `id` | `id`（昇順）または `popular`（お気に入り数の多い順）。 |

- **成功レスポンス 200**
  ```json
  {
    "cocktails": [
      {
        "id": 3,
        "name": "Martini",
        "name_ja": "マティーニ",
        "base": "gin",
        "glass": "martini_glass",
        "glass_ja": "マティーニグラス",
        "description": "カクテル説明",
        "strength": "strong",
        "technique": "stir",
        "instructions": "Stir with ice...",
        "instructions_ja": "氷と共にステア...",
        "image_url": "https://example.com/martini.jpg",
        "image_url_override": "https://example.com/martini.jpg",
        "created_at": "2025-10-20T12:34:56Z",
        "updated_at": "2025-10-20T12:34:56Z"
      }
    ],
    "meta": {
      "current_page": 1,
      "per_page": 9,
      "total_count": 25,
      "total_pages": 3
    }
  }
  ```
- **備考**
  - レスポンスには ActiveRecord の全属性が含まれる。
  - キャッシュ: クエリ条件ごとに 1 時間。

#### GET /api/v1/cocktails/:id
- **認証**: 不要
- **目的**: カクテル詳細（材料含む）
- **成功レスポンス 200**
  ```json
  {
    "id": 3,
    "name": "Martini",
    "name_ja": "マティーニ",
    "base": "gin",
    "glass": "martini_glass",
    "glass_ja": "マティーニグラス",
    "description": "カクテル説明",
    "strength": "strong",
    "technique": "stir",
    "instructions": "Stir with ice...",
    "instructions_ja": "氷と共にステア...",
    "image_url": "https://example.com/martini.jpg",
    "ingredients": [
      {
        "name": "ジン",
        "name_en": "Gin",
        "amount": "45ml",
        "amount_en": "45ml",
        "position": 1
      },
      {
        "name": "ドライベルモット",
        "name_en": "Dry Vermouth",
        "amount": "15ml",
        "amount_en": "15ml",
        "position": 2
      }
    ]
  }
  ```
- **失敗レスポンス 404**: 存在しない ID の場合。Rails により自動で 404 が返る。
- **備考**: 詳細は 24 時間キャッシュ。

#### GET /api/v1/cocktails/todays_pick
- **認証**: 不要
- **目的**: 日替わり推しカクテル（ランダム 1 件）
- **成功レスポンス 200**: `GET /cocktails/:id` と同形式。
- **失敗レスポンス 404**
  ```json
  { "error": "No cocktails available" }
  ```
- **備考**: 日付ごとに 1 件キャッシュ（1 日に 1 度更新）。

---

### 3.3 お気に入りエンドポイント
すべて JWT 認証必須。ヘッダーに `Authorization: Bearer <JWT>`。

#### GET /api/v1/favorites
- **目的**: ログインユーザーのお気に入り一覧
- **レスポンス 200**
  ```json
  {
    "status": { "code": 200, "message": "お気に入り一覧を取得しました。" },
    "data": [
      {
        "id": 42,
        "cocktail": {
          "id": 3,
          "name": "Martini",
          "name_ja": "マティーニ",
          "base": "gin",
          "glass": "martini_glass",
          "glass_ja": "マティーニグラス",
          "description": "カクテル説明",
          "strength": "strong",
          "technique": "stir",
          "instructions": "Stir with ice...",
          "instructions_ja": "氷と共にステア...",
          "image_url": "https://example.com/martini.jpg",
          "image_url_override": "https://example.com/martini.jpg",
          "created_at": "2025-10-20T12:34:56Z",
          "updated_at": "2025-10-20T12:34:56Z",
          "is_favorited": true
        },
        "created_at": "2025-11-05T09:00:00Z"
      }
    ]
  }
  ```
- **未認証 401**
  ```json
  { "error": "認証が必要です。ログインしてください。" }
  ```

#### POST /api/v1/favorites
- **目的**: カクテルをお気に入り登録
- **リクエストボディ**
  ```json
  { "cocktail_id": 3 }
  ```
- **成功レスポンス 201**
  ```json
  {
    "status": { "code": 201, "message": "お気に入りに追加しました。" },
    "data": {
      "id": 43,
      "cocktail": {
        "id": 3,
        "name": "Martini",
        "...": "...",
        "is_favorited": true
      }
    }
  }
  ```
- **バリデーション**
  - `cocktail_id`: 必須。存在しない ID → 404 + `"status.message": "カクテルが見つかりません。"`
  - ユニーク制約: 同じカクテルを重複登録すると 422。`errors` に `"User has already been taken"` などのメッセージ。

#### DELETE /api/v1/favorites/:id
- **目的**: お気に入り解除
- **成功レスポンス 200**
  ```json
  { "status": { "code": 200, "message": "お気に入りから削除しました。" } }
  ```
- **存在しない/他ユーザーの ID**: 404。

---

### 3.4 管理者エンドポイント

#### PUT /api/v1/admin/cocktails/:id
- **認証**: 必須（さらに `current_user.admin?` が true）
- **目的**: カクテル基本情報の更新（材料は別途手動対応）
- **リクエストボディ**
  ```json
  {
    "cocktail": {
      "name": "Updated Martini",
      "name_ja": "新マティーニ",
      "glass": "martini_glass",
      "glass_ja": "マティーニグラス",
      "instructions": "Updated instructions...",
      "instructions_ja": "更新済み手順...",
      "description": "新しい説明",
      "base": "gin",
      "strength": "medium",
      "technique": "stir",
      "image_url_override": "https://example.com/new.jpg"
    }
  }
  ```
- **成功レスポンス 200**: `GET /api/v1/cocktails/:id` と同形式（更新後データ）。
- **失敗レスポンス**
  - 403: 一般ユーザーがアクセス → `{ "error": "管理者権限が必要です" }`
  - 404: 存在しない ID
  - 422: バリデーション NG（`errors` 配列）
- **副作用**: キャッシュ（詳細、一覧、today’s pick）を無効化。

---

### 3.5 ヘルスチェック

#### GET /health
- **認証**: 不要
- **レスポンス 200**: プレーンテキスト `"OK"`
- **利用目的**: インフラ監視（L7 ヘルスチェック）

---

## 4. 実装メモと今後の検討事項
- **Ingredients API**: 現状実装なし（旧仕様の記述は削除）。材料一覧が必要な場合は `Ingredient` モデルを利用した新規エンドポイント追加を検討。
- **キャッシュクリア**: カクテル更新時のみキャッシュを明示的に削除。その他の CRUD を追加する場合は同様の無効化が必要。
- **トークン管理**: クライアントはトークン失効（24 時間・ログアウト）を考慮し、定期的な再ログインやトークン更新 UI を提供する。
- **エラーハンドリング**: Rails 既定の 404/500 レスポンスは英語メッセージとなるため、多言語対応が必要ならグローバルハンドラの導入を検討。

---

以上。必要に応じて本ドキュメントを更新し、最終更新日を必ず書き換えること。
