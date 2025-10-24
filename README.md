# Today's Cocktail 🍹

Ruby on Rails（API） × React（Vite） × Supabase（PostgreSQL）で構築されたカクテル情報アプリです。

## 📋 Tech Stack

- **Backend**: Ruby on Rails 8.0.3 (API mode)
- **Frontend**: React 19.1.1 + TypeScript + Vite
- **Database**: Supabase (PostgreSQL)
- **Container**: Docker + Docker Compose
- **UI**: Tailwind CSS + shadcn/ui

---

## 🧾 Requirements

| Tool | Version | Install Command |
|------|----------|----------------|
| asdf | latest | `brew install asdf` |
| Ruby | 3.4.6 | `asdf plugin add ruby && asdf install ruby 3.4.6` |
| Node.js | 22.21.0 | `asdf plugin add nodejs && asdf install nodejs 22.21.0` |
| Yarn | 1.22.22 | `asdf plugin add yarn && asdf install yarn 1.22.22` |
| Docker Desktop | latest | [Download](https://www.docker.com/products/docker-desktop/) |
| Supabase CLI | latest | `brew install supabase/tap/supabase` |

---

## ⚙️ 1. Project Setup

```bash
# Clone repository
git clone https://github.com/iakito-dev/todays-cocktail.git
cd todays-cocktail

# Install runtime versions (requires .tool-versions)
asdf install

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Install dependencies
cd backend && bundle install
cd ../frontend && yarn install
cd ..
```

---

## 🗄️ 2. Supabase Setup (Local Database)

Supabase をローカルで起動し、Rails API から接続します。

```bash
# Start local Supabase services (supabase/config.toml使用)
supabase start

# Check status
supabase status
```

**接続情報（自動設定）**:
| Service | URL/Info |
|---------|----------|
| Database URL | `postgresql://postgres:postgres@127.0.0.1:54322/postgres` |
| API URL | `http://127.0.0.1:54321` |
| Studio (管理UI) | `http://127.0.0.1:54323` |
| Publishable Key | `supabase status`で確認 |

> Rails設定では `config/database.yml` でDATABASE_URLから自動接続されます。

---

## 🐳 3. Run with Docker

**前提**: Supabaseが起動していること（`supabase start`）

```bash
# アプリケーション全体をDockerで起動
docker compose up --build

# バックグラウンドで起動する場合
docker compose up -d --build
```

**アクセス先一覧**:
| Service | URL | 備考 |
|----------|-----|------|
| Rails API | http://localhost:3000 | Backend API |
| React App | http://localhost:5173 | Frontend (Vite dev server) |
| Supabase Studio | http://localhost:54323 | Database 管理UI |
| Health Check | http://localhost:3000/health | API 稼働確認 |

---

## ⚙️ 4. Environment Variables

環境変数は各ディレクトリの`.env`ファイルで管理されています。

### Backend (.env)
```bash
# Rails Backend環境変数
DATABASE_URL=postgres://postgres:postgres@localhost:54322/app_development
DATABASE_URL_TEST=postgres://postgres:postgres@localhost:54322/app_test
RAILS_ENV=development
```

### Frontend (.env)
```bash
# React Frontend環境変数
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=supabase statusで取得
```

> **Note**: Dockerコンテナから接続する場合、`docker-compose.yml`内で`host.docker.internal`が自動設定されます。

---

## ✅ 5. Verify Setup

```bash
# 1. Supabaseサービス確認
supabase status

# 2. Rails API Health Check
curl http://localhost:3000/health
# または
open http://localhost:3000/health

# 3. Frontend アプリ確認
open http://localhost:5173

# 4. RSpec テスト実行 (Docker内)
docker compose exec backend bundle exec rspec

# 5. フロントエンド テスト/Lint
docker compose exec frontend npm run lint
docker compose exec frontend npm run format:check
```

---

## 🛠️ Development Commands

### 🐳 Docker関連
```bash
# 起動
docker compose up -d

# ログ確認
docker compose logs -f backend
docker compose logs -f frontend

# コンテナ内でコマンド実行
docker compose exec backend rails console
docker compose exec backend bundle exec rails db:migrate
docker compose exec frontend npm install <package>

# 停止・削除
docker compose down
docker compose down -v  # volumeも削除
```

### 🗄️ Database管理
```bash
# Supabase起動/停止
supabase start
supabase stop

# データベースリセット
supabase db reset

# マイグレーション
docker compose exec backend rails db:create
docker compose exec backend rails db:migrate
docker compose exec backend rails db:seed
```

### 🧪 テスト・品質
```bash
# Backend tests
docker compose exec backend bundle exec rspec
docker compose exec backend bundle exec rubocop

# Frontend tests & lint
docker compose exec frontend npm run lint
docker compose exec frontend npm run format
```

---

## 🚀 Deployment

本番環境のデプロイ設定については、`config/deploy.yml`（Kamal）または追加のドキュメントを参照してください。

---

## 🧩 Troubleshooting

| 問題 | 解決方法 |
|------|----------|
| Supabaseが起動しない | `supabase stop && supabase start` |
| Docker接続エラー | Docker Desktopの再起動 |
| ポート競合 | `lsof -ti:3000 \| xargs kill` |
| 環境変数が反映されない | `.env`ファイルの場所・内容確認 |
| フロントエンドでAPI接続失敗 | `VITE_API_URL`の値確認 |

---

## 📝 Project Structure

```
todays-cocktail/
├── backend/          # Rails API
├── frontend/         # React + Vite
├── supabase/         # Database config
├── docker-compose.yml
└── .tool-versions    # asdf runtime versions
```
