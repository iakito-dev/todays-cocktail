（あとで修正する）

# はじめに

Today’s Cocktail は、「今日の気分にぴったりなカクテルをすぐに見つけたい」という思いから生まれた学習兼ポートフォリオです。要件定義から設計、実装、デプロイ、ドキュメント整備までを完結させることを目標とし、バックエンドには Ruby on Rails（API モード）、フロントエンドには React（Vite）を採用しています。

---

## アプリ紹介

### 概要
- カクテルをベース酒・材料・人気度といった複数軸で検索できる Web アプリ
- レシピ詳細では英語／日本語の材料名や手順を併記し、初心者でも各カクテルごとの雰囲気を掴める内容を目指しました
- 気に入ったカクテルはお気に入り登録して自分だけのリストを育てることができます

### URL
- プロダクト: https://todayscocktails.com

### サービス開発の背景
- バーのメニューを見ても味が想像できない、自宅にある材料で何が作れるか分からない――そんなちょっとした不便を解消する「検索しやすいカクテル図鑑」を作りたいと考えました

### 主な実装機能
- ベース酒・材料キーワード・人気順を組み合わせた検索とページネーション
- 日替わりでおすすめカクテルを紹介する「今日の一杯」（24 時間キャッシュ）
- 英日併記のレシピ詳細（材料順、分量、作り方、説明、画像 URL）
- Devise + JWT によるユーザー登録／ログインとお気に入り CRUD
- 管理者向けカクテル編集 API（更新後にキャッシュを自動削除）

ユースケースや非機能要件は `docs/functional_requirements.md` に整理しています。

---

## 採用技術

| レイヤー | 技術 |
| --- | --- |
| フロントエンド | React 19 / TypeScript / Vite / Tailwind CSS / shadcn/ui |
| バックエンド | Ruby 3.4.6 / Rails 8.0.3（API モード） / Devise + devise-jwt |
| データベース | Supabase Cloud（PostgreSQL 15 系） |
| インフラ | Vercel（フロント）、Render（API）、Cloudflare DNS、Terraform（IaC 準備中） |
| CI/CD | GitHub Actions（lint / test）、Vercel / Render のデプロイパイプライン |
| 開発環境 | Docker / Docker Compose / asdf |

詳しい選定理由は `docs/tech_stack.md` にまとめています。

---

## 構成図

### インフラ構成
```mermaid
flowchart LR
  User[ユーザー] -->|HTTPS| Cloudflare[Cloudflare DNS]
  Cloudflare --> Vercel[Vercel\n(React SPA)]
  Cloudflare --> Render[Render\n(Rails API)]
  Render --> Supabase[(Supabase Cloud\nPostgreSQL)]
  Render --> Cache[Rail.cache / Redis 検討中]
```

### ER 図（抜粋）
```mermaid
erDiagram
  USERS ||--o{ FAVORITES : "お気に入り"
  COCKTAILS ||--o{ FAVORITES : "お気に入り"
  COCKTAILS ||--o{ COCKTAIL_INGREDIENTS : "材料構成"
  INGREDIENTS ||--o{ COCKTAIL_INGREDIENTS : "使用材料"
  USERS ||--o{ JWT_DENYLISTS : "無効化トークン"
```

テーブル定義の詳細は `docs/db_design.md` を参照してください。

### 画面遷移図（概要）
```mermaid
flowchart TD
  Home[トップ / 検索] --> Detail[カクテル詳細]
  Home --> Favorites[お気に入り一覧]
  Home --> Login[ログイン]
  Login --> Signup[サインアップ]
  Detail --> Favorites
  Home --> TodaysPick[今日の一杯]
```

UI とレスポンシブ方針は `docs/wireframe.md` にまとめています。

---

## 技術選定理由（抜粋）

- **Rails 8 (API モード)**
  REST API の整備と Devise を活かしたメール確認付き認証を最短で実装できるため。日本語資料も豊富で、ポートフォリオとしても説明しやすい。
- **React + Vite + TypeScript**
  SPA として自由度の高い UI を構築しつつ、Vite で軽快な開発体験、TypeScript で静的型チェックを実現。
- **Supabase Cloud**
  追記予定
- **Render / Vercel / Cloudflare**
  未定
- **Docker / asdf**
  ローカルでも本番に近い構成を再現できるようにし、開発環境の差異を最小化しました。

---

## 工夫した点

-   追記予定

---

## 苦労した点

-   追記予定
---

## 今後の課題

- `/api/v1/ingredients` を公開し、フロントでの材料サジェストやオートコンプリートに活かす
- 画像アップロードの仕組み（Supabase Storage or Active Storage + S3）の導入
- 味わい・香りなどのメタ情報をタグ化し、レコメンド精度を高める
- GitHub Actions と Render/Vercel を統合した CI/CD パイプラインの整備
- Terraform での本番インフラ定義、ログ監視・モニタリング（Sentry / Logflare 等）の導入

---

## セットアップ（ローカル開発時）

### 0. 必要なツール

| ツール | バージョン | 備考 |
| --- | --- | --- |
| asdf | latest | ランタイム管理 |
| Ruby | 3.4.6 | `asdf install ruby 3.4.6` |
| Node.js | 22.21.0 | `asdf install nodejs 22.21.0` |
| Yarn | 1.22.22 | `asdf install yarn 1.22.22` |
| Docker Desktop | latest | コンテナ実行 |
| Supabase CLI | latest | `brew install supabase/tap/supabase` |

### 1. リポジトリの取得と依存関係のインストール

```bash
git clone https://github.com/iakito-dev/todays-cocktail.git
cd todays-cocktail

asdf install

cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

cd backend && bundle install
cd ../frontend && yarn install
```

### 2. Supabase ローカルの起動（任意）

本番は Supabase Cloud を利用していますが、ローカルで検証したい場合は以下で起動できます。

```bash
supabase start
supabase status
```

| サービス | ローカル接続 URL |
| --- | --- |
| Database | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| API | `http://127.0.0.1:54321` |
| Studio | `http://127.0.0.1:54323` |

### 3. アプリケーションの起動

```bash
docker compose up --build
# バックグラウンド起動
docker compose up -d --build
```

| サービス | URL |
| --- | --- |
| Rails API (local) | http://localhost:3000 |
| React (local) | http://localhost:5173 |
| Health Check | http://localhost:3000/health |
| Supabase Studio (local) | http://localhost:54323 |

### 4. よく使うコマンド

```bash
# Docker
docker compose up -d
docker compose logs -f backend
docker compose exec backend rails console
docker compose down -v

# データベース
supabase db reset
docker compose exec backend rails db:seed

# キャッシュ
docker compose exec backend bin/rails runner 'Rails.cache.clear'

# テスト・品質
docker compose exec backend bundle exec rspec
docker compose exec backend bundle exec rubocop
docker compose exec frontend npm run lint
docker compose exec frontend npm run test
```

---

## ドキュメント

- コンセプト・ペルソナ: `docs/concept_design.md`
- 機能要件: `docs/functional_requirements.md`
- API 仕様: `docs/api-design.md`
- データベース設計: `docs/db_design.md`
- 画面設計: `docs/wireframe.md`
- 技術選定メモ: `docs/tech_stack.md`
- 旧バージョンの資料: `docs/old/`

---

## 作者

- Akito（iakito-dev）
- GitHub: https://github.com/iakito-dev
- Figma プロトタイプ: https://opt-mute-12091200.figma.site/

設計からデプロイまで一通り手を動かした経験を整理するために育てているプロジェクトです。感想や改善アイデアなどあればぜひお知らせください。
