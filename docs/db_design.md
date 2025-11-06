# データベース設計（Today’s Cocktail）

最終更新: 2025-11-06  
使用DB: PostgreSQL (Supabase ホスティング)  
文字コード: UTF-8 / タイムゾーン: UTC

---

## 1. ER 図（現行実装）

```mermaid
erDiagram
  USERS ||--o{ FAVORITES : "お気に入り"
  COCKTAILS ||--o{ FAVORITES : "お気に入り"
  COCKTAILS ||--o{ COCKTAIL_INGREDIENTS : "材料構成"
  INGREDIENTS ||--o{ COCKTAIL_INGREDIENTS : "使用材料"
  USERS ||--o{ JWT_DENYLISTS : "無効化トークン"

  USERS {
    bigint id PK
    string email
    boolean admin
    string name
    datetime confirmed_at
  }

  COCKTAILS {
    bigint id PK
    string name unique
    string name_ja
    integer base
    integer strength
    integer technique
    string glass
    string glass_ja
  }

  INGREDIENTS {
    bigint id PK
    string name unique
    string name_ja
  }

  FAVORITES {
    bigint id PK
    bigint user_id FK
    bigint cocktail_id FK
  }

  COCKTAIL_INGREDIENTS {
    bigint id PK
    bigint cocktail_id FK
    bigint ingredient_id FK
    string amount_text
    string amount_ja
    integer position
  }

  JWT_DENYLISTS {
    bigint id PK
    string jti unique
    datetime exp
    bigint user_id?  // Devise::JWT が内部的に参照
  }
```

---

## 2. テーブル定義

テーブルは Rails の `schema.rb (version: 2025_11_05_090000)` と各モデル実装を基に記載。  
制約列には **DB 制約** と **アプリケーション側のバリデーション** を明示する。

### 2.1 users
Devise による会員管理。メール確認（confirmable）と JWT 認証に対応。

| カラム名 | 型 | 制約 | 補足 |
| --- | --- | --- | --- |
| id | bigint | PK | |
| email | string | `NOT NULL`, `UNIQUE` | ログイン ID。小文字に正規化。 |
| encrypted_password | string | `NOT NULL` | Devise がハッシュ化して保存。 |
| name | string | | 任意の表示名。 |
| admin | boolean | `NOT NULL`, default `false` | 管理者フラグ。 |
| reset_password_token | string | `UNIQUE` | パスワード再設定用トークン。 |
| reset_password_sent_at | datetime | | 再設定メール送信時刻。 |
| remember_created_at | datetime | | Remember me 用。 |
| confirmation_token | string | `UNIQUE` | メール確認トークン。 |
| confirmed_at | datetime | | メール確認完了時刻。 |
| confirmation_sent_at | datetime | | 確認メール送信時刻。 |
| unconfirmed_email | string | | メール変更時に一時保持。 |
| created_at / updated_at | datetime | `NOT NULL` | Rails 自動管理。 |

**関連**
- `has_many :favorites`, `has_many :favorite_cocktails, through: :favorites`
- Devise の confirmable / recoverable / rememberable / jwt_authenticatable を使用。

### 2.2 cocktails
アプリで表示するカクテルのマスタ。英日両対応の名称・グラス名・レシピ説明を保持。

| カラム名 | 型 | 制約 | 補足 |
| --- | --- | --- | --- |
| id | bigint | PK | |
| name | string | `NOT NULL`, `UNIQUE` index | 英語名。空白を許容。 |
| name_ja | string | index | 日本語名。重複可。 |
| base | integer | `NOT NULL`, default `0` | `enum :base` (`gin`, `rum`, `whisky`, `vodka`, `tequila`, `beer`, `wine`) |
| strength | integer | `NOT NULL`, default `0` | `enum :strength` (`light`, `medium`, `strong`) |
| technique | integer | `NOT NULL`, default `0` | `enum :technique` (`build`, `stir`, `shake`) |
| glass | string | | 英語グラス名。 |
| glass_ja | string | | 日本語グラス名。 |
| description | text | | フロントで表示する説明文。 |
| instructions | text | | 作り方（英語）。 |
| instructions_ja | text | | 作り方（日本語）。 |
| image_url_override | string | | 手動設定の画像 URL。 |
| created_at / updated_at | datetime | `NOT NULL` | |

**関連**
- `has_many :cocktail_ingredients, dependent: :destroy`
- `has_many :ingredients, through: :cocktail_ingredients`
- `has_many :favorites, dependent: :destroy`
- `has_many :favorited_by_users, through: :favorites`

**備考**
- モデルバリデーション: `validates :name, presence: true`
- 画像は現状 Active Storage 未使用。`display_image_url` が `image_url_override` を返す。

### 2.3 ingredients
材料マスタ。英語/日本語名の両方をサポート。

| カラム名 | 型 | 制約 | 補足 |
| --- | --- | --- | --- |
| id | bigint | PK | |
| name | string | `NOT NULL`, `UNIQUE` index | 英語表記。 |
| name_ja | string | | 日本語表記。 |
| created_at / updated_at | datetime | `NOT NULL` | |

**関連**
- `has_many :cocktail_ingredients, dependent: :destroy`
- `has_many :cocktails, through: :cocktail_ingredients`

**備考**
- モデルでも `validates :name, presence: true, uniqueness: true` を実施。

### 2.4 cocktail_ingredients
カクテルと材料の中間テーブル。表示順と日本語表記の分量を保持。

| カラム名 | 型 | 制約 | 補足 |
| --- | --- | --- | --- |
| id | bigint | PK | |
| cocktail_id | bigint | `NOT NULL`, FK → `cocktails.id` (`ON DELETE CASCADE`) | |
| ingredient_id | bigint | `NOT NULL`, FK → `ingredients.id` | |
| amount_text | string | `NOT NULL` | 英語または一般的な表記（モデルでも `presence: true`） |
| amount_ja | string | | 日本語表記。 |
| position | integer | | 並び順。未指定時は `id` の昇順。 |
| created_at / updated_at | datetime | `NOT NULL` | |

**関連**
- `belongs_to :cocktail`
- `belongs_to :ingredient`
- `scope :ordered, -> { order(:position, :id) }`

**備考**
- モデルで `validates :cocktail_id, uniqueness: { scope: :ingredient_id }` を定義。DB 側にも複合ユニークインデックスを付与済み。

### 2.5 favorites
ユーザーとカクテルの多対多（お気に入り機能）。

| カラム名 | 型 | 制約 | 補足 |
| --- | --- | --- | --- |
| id | bigint | PK | |
| user_id | bigint | `NOT NULL`, FK → `users.id` (`ON DELETE CASCADE`) | |
| cocktail_id | bigint | `NOT NULL`, FK → `cocktails.id` (`ON DELETE CASCADE`) | |
| created_at / updated_at | datetime | `NOT NULL` | |

**インデックス**
- `(user_id, cocktail_id)` 複合 `UNIQUE`（重複お気に入り禁止）
- `user_id`, `cocktail_id` 単体 index

### 2.6 jwt_denylists
Devise::JWT の denylist ストラテジを実現するためのテーブル。ログアウト済み・失効済み JWT を保持。

| カラム名 | 型 | 制約 | 補足 |
| --- | --- | --- | --- |
| id | bigint | PK | |
| jti | string | `UNIQUE` | JWT の ID クレーム。 |
| exp | datetime | | トークン有効期限。 |
| created_at / updated_at | datetime | `NOT NULL` | |

**備考**
- `user_id` カラムは存在しないが、Devise 側で `jti` からトークンを無効化。  
- ログアウト時に `JwtDenylist.create!(jti:, exp:)` を実行。失効済みトークンはアプリ側で破棄対象として扱う。

---

## 3. リレーションと削除動作

| リレーション | 種別 | 削除ポリシー |
| --- | --- | --- |
| `User -< Favorite` | 1対多 | ユーザー削除時にお気に入りを自動削除（FK `ON DELETE CASCADE`） |
| `Cocktail -< Favorite` | 1対多 | カクテル削除時に紐づくお気に入りを自動削除 |
| `Cocktail -< CocktailIngredient` | 1対多 | カクテル削除で材料構成も削除 |
| `Ingredient -< CocktailIngredient` | 1対多 | 材料削除時には関連が削除されず制約違反になるため、事前にチェックが必要 |

---

## 4. モデル層での代表的なバリデーション

- `Cocktail`: `validates :name, presence: true`
- `Ingredient`: `validates :name, presence: true, uniqueness: true`
- `CocktailIngredient`: `validates :amount_text, presence: true`; `validates :cocktail_id, uniqueness: { scope: :ingredient_id }`
- `Favorite`: `validates :user_id, uniqueness: { scope: :cocktail_id }`

DB 制約とアプリ側バリデーションは主要項目について整合済み。

---

## 5. インデックス一覧（主要）

- `users`  
  - `index_users_on_email` (UNIQUE)  
  - `index_users_on_reset_password_token` (UNIQUE)  
  - `index_users_on_confirmation_token` (UNIQUE)

- `cocktails`  
  - `index_cocktails_on_name` (UNIQUE)  
  - `index_cocktails_on_name_ja`  
  - `index_cocktails_on_base`

- `ingredients`  
  - `index_ingredients_on_name` (UNIQUE)

- `cocktail_ingredients`  
  - `index_cocktail_ingredients_on_cocktail_id`  
  - `index_cocktail_ingredients_on_ingredient_id`  
  - `index_cocktail_ingredients_on_cocktail_id_and_ingredient_id` (UNIQUE)

- `favorites`  
  - `index_favorites_on_user_id`  
  - `index_favorites_on_cocktail_id`  
  - `index_favorites_on_user_id_and_cocktail_id` (UNIQUE)

- `jwt_denylists`  
  - `index_jwt_denylists_on_jti` (UNIQUE)

---

## 6. 今後の拡張メモ

1. **材料一覧 API**  
   - 現状 API なし。将来 `/api/v1/ingredients` を実装する場合はペジネーション・検索条件を検討。

2. **画像管理**  
   - `image_url_override` のみ利用。Active Storage を導入する場合は別テーブル (`active_storage_blobs`, `active_storage_attachments`) が追加される。

3. **多言語対応**  
   - `name_ja`, `instructions_ja`, `glass_ja`, `amount_ja` など日本語列を保持。追加言語が必要になったら別テーブル（例: `cocktail_translations`）化も検討。

4. **分析用フィールド**  
   - お気に入り数のキャッシュカラム、公開フラグ、タグテーブルなどを追加するとパフォーマンス向上や機能拡張が容易。

5. **DB 制約の継続的見直し**  
   - 新しい機能追加時は関連バリデーションと DB 制約が揃っているかを確認し、必要であれば追加のユニーク制約や NOT NULL 制約を検討する。

---

このドキュメントはプロジェクト初心者でもテーブル構造を俯瞰できるように、モデル実装と Rails スキーマを照らし合わせて作成している。設計変更を行った場合はこのファイルと最終更新日を更新すること。
