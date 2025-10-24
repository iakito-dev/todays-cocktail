# API設計書（Today’s Cocktail）

バージョン: v1
ベースURL: `/api/v1`
作成者: Akito
最終更新: 2025-10-24

---

## 1. 概要

本ドキュメントは「Today’s Cocktail」アプリのバックエンドAPI仕様を定義する。
主にフロントエンド（React / Next.js）から利用されることを前提とし、Rails（APIモード）をバックエンドとして設計する。

本APIは以下の目的を持つ：
- カクテル情報の取得（一覧・詳細・検索・ランダム表示）
- 材料の一覧取得
- ログインユーザーのお気に入り管理（登録 / 削除 / 一覧）
- ユーザー登録・ログイン・ログアウト（JWT認証対応）

---

## 2. カクテル API

### 2-1. カクテル一覧取得
**Method:** `GET`
**Endpoint:** `/cocktails`
**Auth:** 不要
**Purpose:** カクテル一覧を取得（検索・フィルタ対応）

**Request Example**
```
GET /api/v1/cocktails?base=gin&name=martini&sort=popular
```

**Query Parameters**
| パラメータ | 型 | 必須 | 例 | 説明 |
|------------|----|------|----|------|
| `base` | string | 任意 | gin | ベースで絞り込み（enum: gin, rum, whisky, vodka, tequila, beer） |
| `name` | string | 任意 | martini | カクテル名で部分一致検索 |
| `ingredients` | string | 任意 | lime,gin | 材料をカンマ区切りで指定 |
| `sort` | string | 任意 | name / popular | 並び順（名前順 or 人気順） |

**Response: 200 OK**
```json
[
  {
    "id": 1,
    "name": "マティーニ",
    "base": "ジン",
    "strength": "ストロング",
    "technique": "ステア",
    "image_url": "https://example.com/martini.jpg"
  },
  {
    "id": 2,
    "name": "ジントニック",
    "base": "ジン",
    "strength": "ライト",
    "technique": "ビルド",
    "image_url": "https://example.com/gin_tonic.jpg"
  }
]
```

**Response: 400 Bad Request**
```json
{ "error": "Invalid sort parameter" }
```

---

### 2-2. カクテル詳細取得
**Method:** `GET`
**Endpoint:** `/cocktails/:id`
**Auth:** 不要
**Purpose:** 特定のカクテル詳細情報を取得する

**Response: 200 OK**
```json
{
  "id": 3,
  "name": "ウイスキーサワー",
  "base": "ウイスキー",
  "strength": "ミディアム",
  "technique": "シェイク",
  "glass": "ロックグラス",
  "instructions": "シェイカーに氷と材料を入れてシェイクする。ロックグラスに注ぐ。",
  "image_url": "https://example.com/whisky_sour.jpg",
  "ingredients": [
    {"name": "ウイスキー", "amount_text": "45ml"},
    {"name": "レモンジュース", "amount_text": "20ml"},
    {"name": "シュガーシロップ", "amount_text": "15ml"}
  ]
}
```

**Response: 404 Not Found**
```json
{ "error": "Cocktail not found" }
```

---

### 2-3. 今日の一杯（ランダム取得）
**Method:** `GET`
**Endpoint:** `/cocktails/random`
**Auth:** 不要
**Purpose:** トップページで「今日の一杯」をランダムに1件取得

**Response: 200 OK**
```json
{
  "id": 8,
  "name": "マルガリータ",
  "base": "テキーラ",
  "strength": "ストロング",
  "image_url": "https://example.com/margarita.jpg"
}
```

---

## 3. 材料 API

### 3-1. 材料一覧取得
**Method:** `GET`
**Endpoint:** `/ingredients`
**Auth:** 不要
**Purpose:** 材料一覧を取得（検索バー・サジェスト機能用）

**Response: 200 OK**
```json
[
  {"id": 1, "name": "ジン"},
  {"id": 2, "name": "ライムジュース"},
  {"id": 3, "name": "トニックウォーター"}
]
```

---

## 4. お気に入り API

### 4-1. お気に入り一覧取得
**Method:** `GET`
**Endpoint:** `/favorites`
**Auth:** 必須（JWT）
**Purpose:** ログインユーザーのお気に入り一覧を取得

**Response: 200 OK**
```json
[
  {
    "cocktail_id": 3,
    "name": "ウイスキーサワー",
    "image_url": "https://example.com/whisky_sour.jpg"
  }
]
```

---

### 4-2. お気に入り登録
**Method:** `POST`
**Endpoint:** `/favorites`
**Auth:** 必須
**Purpose:** カクテルをお気に入りに登録する

**Request**
```json
{
  "cocktail_id": 3
}
```

**Response: 201 Created**
```json
{
  "message": "Added to favorites",
  "favorite": { "id": 15, "cocktail_id": 3 }
}
```

**Response: 409 Conflict**
```json
{ "error": "Already added to favorites" }
```

---

### 4-3. お気に入り削除
**Method:** `DELETE`
**Endpoint:** `/favorites/:id`
**Auth:** 必須
**Purpose:** お気に入り登録を解除する

**Response: 200 OK**
```json
{ "message": "Removed from favorites" }
```

---

## 5. 認証 API

### 5-1. ユーザー登録
**Method:** `POST`
**Endpoint:** `/auth/signup`
**Auth:** 不要
**Purpose:** 新規ユーザーを登録する

**Request**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

**Response: 201 Created**
```json
{
  "data": { "id": 1, "email": "user@example.com" },
  "token": "xxxxx.yyyyy.zzzzz"
}
```

**Validation Errors**
```json
{ "error": "Email has already been taken" }
```

---

### 5-2. ログイン
**Method:** `POST`
**Endpoint:** `/auth/login`
**Auth:** 不要
**Purpose:** ログインしてJWTトークンを取得する

**Request**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response: 200 OK**
```json
{
  "token": "xxxxx.yyyyy.zzzzz",
  "user": { "id": 1, "email": "user@example.com" }
}
```

**Response: 401 Unauthorized**
```json
{ "error": "Invalid email or password" }
```

---

### 5-3. ログアウト
**Method:** `DELETE`
**Endpoint:** `/auth/logout`
**Auth:** 必須
**Purpose:** 現在のトークンを無効化する

**Response: 200 OK**
```json
{ "message": "Logged out successfully" }
```

---

## 6. Enum定義（Rails側）

```ruby
class Cocktail < ApplicationRecord
  enum base: { gin: 0, rum: 1, whisky: 2, vodka: 3, tequila: 4, beer: 5 }
  enum strength: { light: 0, medium: 1, strong: 2 }
  enum technique: { build: 0, stir: 1, shake: 2 }
end
```

---

## 7. APIルーティング一覧

| HTTP verb | パス | コントローラ#アクション | 認証 | 機能カテゴリ |
|------------|------|--------------------------|------|----------------|
| **GET** | `/api/v1/cocktails` | `api/v1/cocktails#index` | 不要 | 一覧取得 |
| **GET** | `/api/v1/cocktails/:id` | `api/v1/cocktails#show` | 不要 | 詳細取得 |
| **GET** | `/api/v1/cocktails/random` | `api/v1/cocktails#random` | 不要 | ランダム取得 |
| **GET** | `/api/v1/ingredients` | `api/v1/ingredients#index` | 不要 | 材料一覧 |
| **GET** | `/api/v1/favorites` | `api/v1/favorites#index` | 必須 | お気に入り一覧 |
| **POST** | `/api/v1/favorites` | `api/v1/favorites#create` | 必須 | お気に入り登録 |
| **DELETE** | `/api/v1/favorites/:id` | `api/v1/favorites#destroy` | 必須 | お気に入り削除 |
| **POST** | `/auth/signup` | `api/v1/auth#signup` | 不要 | ユーザー登録 |
| **POST** | `/auth/login` | `api/v1/auth#login` | 不要 | ログイン |
| **DELETE** | `/auth/logout` | `api/v1/auth#logout` | 必須 | ログアウト |

---

## 8. routes.rb（全体構成）

```ruby
namespace :api do
  namespace :v1 do
    resources :cocktails, only: [:index, :show] do
      collection { get :random }
    end

    resources :ingredients, only: [:index]
    resources :favorites, only: [:index, :create, :destroy]

    # 認証系
    post 'auth/signup', to: 'auth#signup'
    post 'auth/login', to: 'auth#login'
    delete 'auth/logout', to: 'auth#logout'
  end
end
```

---

## 9. エラーレスポンス設計

| ステータス | 状況 | 例 |
|-------------|------|----|
| **400 Bad Request** | 不正なパラメータ | `{ "error": "Invalid parameter" }` |
| **401 Unauthorized** | トークン未認証 | `{ "error": "Unauthorized" }` |
| **403 Forbidden** | アクセス権なし | `{ "error": "Access denied" }` |
| **404 Not Found** | リソース未存在 | `{ "error": "Resource not found" }` |
| **409 Conflict** | 重複登録 | `{ "error": "Already exists" }` |
| **500 Internal Server Error** | 予期せぬエラー | `{ "error": "Unexpected error occurred" }` |

---

## 10. 運用・実務上の補足

- **認証方式:** JWT（Devise Token Auth or Supabase Auth対応可）
- **レスポンス形式:** すべて `application/json` UTF-8
- **CORS:** `localhost:3000`（frontend）との通信を許可
- **ページング:** 必要に応じて `/cocktails?page=2&limit=20` の形で拡張予定
- **N+1対策:** `Cocktail.includes(:ingredients)` を使用
- **キャッシュ:** 人気順やランダム取得結果にRedisキャッシュを導入可能
