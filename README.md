（編集中）

# Today's Cocktail　- アプリ紹介

## サービス概要

Today's Cocktail は、「カクテルをもっと身近に」という思いから生まれたカクテルレシピ検索サービスです。  
ベース種類・材料・人気順など複数の軸でレシピ検索ができ、気に入った一杯はお気に入りとして保存できます。  
視覚的にわかりやすい画像と直感的な UI により、初心者でも安心して新しいカクテルに出会える体験を提供します。

<img width="1200" height="630" alt="ogp_img" src="https://github.com/user-attachments/assets/f07884a7-66ee-484b-a2d6-d77410a86c90" />

### URL

- https://todayscocktails.com

### ゲストユーザーアカウント
Email: guestuser@example.com
Password: password123

### サービス開発の背景

開発者自身、休日の飲み歩きや晩酌が好きでよくバーやパブに足を運ぶのですが、いつもビールやワインといった定番のドリンクに落ち着いてしまい、新しい一杯に挑戦しづらいという悩みがありました。特に海外では、日本で定番のハイボールやレモンサワーがなく、代わりに名前だけでは味や見た目が想像できないカクテルが並び、選ぶのに苦労する場面が多くありました。もし材料や味の傾向、由来、見た目が分かれば、もっと挑戦しやすくなるし、晩酌のレパートリーも広がるはず。そんな課題感と期待から、カクテルの情報をシンプルに整理し、初心者でも選びやすい図鑑のようなアプリがあれば便利だと考え、Today's Cocktail の開発を始めました。


### 主な実装機能

- カクテル一覧表示  
- カクテル詳細ページ（名前、説明文、画像、材料、レシピなどの詳細情報を表示）
- 検索・フィルタリング機能（ジン・ウォッカなどのベース種類や、使用材料による絞り込み）
- 日替わりで「今日の一杯」を提示するレコメンド機能
- 人気順でのソート機能
- ユーザー登録・ログイン機能
- お気に入り保存／お気に入り一覧表示（ログインユーザー限定）
- カクテル情報の作成・編集機能（管理者ユーザー限定）


---

### 使用技術一覧（Tech Stack）

| カテゴリ | 採用技術 |
|----------|-----------|
| フロントエンド | React 19 / TypeScript / Vite 7 / React Router 7 / Tailwind CSS 3 / shadcn/ui（Radix UI） |
| バックエンド API | Ruby 3.4.6 / Rails 8.0.3（API モード） / solid_cache / solid_queue / solid_cable |
| データベース | Supabase（ローカル：Supabase CLI / Cloud：PostgreSQL 17） |
| 認証 | Devise / devise-jwt |
| インフラ・ホスティング | Vercel（フロントエンド） / Render（バックエンド API） / Cloudflare DNS / Docker Compose |
| CI/CD | GitHub Actions（lint / test） |
| UI/UX デザイン | Figma / Figma Make |
| 開発環境 | Git / Docker / Docker Compose / Supabase CLI / VS Code / GitHub Copilot / Codex（Sonnet 4.5 / gpt-5 / gpt-5-codex） / Colima （軽量Docker環境） |
| テスト | Vitest 4（フロント） RSpec（Rails API） |
| 開発支援・コード整形 | ESLint 9 / Prettier 3 / Husky 9 / lint-staged 16 / RuboCop |
| 外部API連携 | OpenAI API（生成・翻訳） / TheCocktailDB API（カクテル情報） / Unsplash API（画像） / Resend API（メール送信） |


詳しい選定理由は `docs/tech_stack.md` に記載予定。

---

## 構成図

## インフラ構成

```mermaid
flowchart LR
  User[ユーザー] -->|HTTPS| Cloudflare[Cloudflare DNS]
  Cloudflare --> Vercel[Vercel\n(React SPA)]
  Cloudflare --> Render[Render\n(Rails API)]
  Render --> Supabase[(Supabase Cloud\nPostgreSQL)]
  Render --> Cache["Rails.cache / Redis（検討中）"]
```

---

## ER 図（抜粋）

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

- 追記予定

---

## 苦労した点

- 追記予定

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

| ツール         | バージョン | 備考                                 |
| -------------- | ---------- | ------------------------------------ |
| asdf           | latest     | ランタイム管理                       |
| Ruby           | 3.4.6      | `asdf install ruby 3.4.6`            |
| Node.js        | 22.21.0    | `asdf install nodejs 22.21.0`        |
| Yarn           | 1.22.22    | `asdf install yarn 1.22.22`          |
| Docker Desktop | latest     | コンテナ実行                         |
| Supabase CLI   | latest     | `brew install supabase/tap/supabase` |

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

| サービス | ローカル接続 URL                                          |
| -------- | --------------------------------------------------------- |
| Database | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| API      | `http://127.0.0.1:54321`                                  |
| Studio   | `http://127.0.0.1:54323`                                  |

### 3. アプリケーションの起動

```bash
docker compose up --build
# バックグラウンド起動
docker compose up -d --build
```

| サービス                | URL                          |
| ----------------------- | ---------------------------- |
| Rails API (local)       | http://localhost:3000        |
| React (local)           | http://localhost:5173        |
| Health Check            | http://localhost:3000/health |
| Supabase Studio (local) | http://localhost:54323       |

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

# サイトマップ
docker compose exec frontend npm run sitemap
```

### サイトマップの再生成

SPA で公開中の静的ページと Rails API から取得したカクテル詳細ページを組み合わせて `frontend/public/sitemap.xml` を自動生成できます。

1. API が参照できる状態にする（ローカルなら `docker compose up backend`、本番データを反映したい場合は `API_BASE_URL=https://todays-cocktails.onrender.com` などを指定）。
2. 必要に応じて `SITE_URL`（デフォルトは `https://todayscocktails.com`）も環境変数で上書きする。
3. `docker compose exec frontend npm run sitemap` を実行。

生成したファイルは Vercel デプロイ時に `dist/sitemap.xml` として公開されます。カクテルを追加・削除・ID変更したとき、固定ページの URL を増やしたとき、またはドメインを切り替えるときに再実行して最新状態へ更新してください。API へ接続できない場合でも静的ページ分の URL は生成されるので、本番デプロイ前に成功ログ（例: `[sitemap] Wrote 46 url entries ...`）を確認してから公開する運用がおすすめです。

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
