# 🧰 Development Setup

開発環境は **Ruby on Rails（API） × React（Vite） × Supabase（PostgreSQL）** の構成です。
以下の手順でローカル環境をセットアップします。

---

## 🧾 Requirements

| Tool | Version | Install Command |
|------|----------|----------------|
| asdf | 0.18.0+ | `brew install asdf` |
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

# Install runtime versions
asdf install

# Install dependencies
cd backend && bundle install
cd ../frontend && yarn install
```

---

## 🗄️ 2. Supabase Setup (Local Database)

Supabase をローカルで起動し、Rails API から接続します。

```bash
# Initialize project (first time only)
supabase init

# Start local Supabase services
supabase start
```

接続情報（デフォルト）:
```
Host: localhost
Port: 54322
User: postgres
Password: postgres
Database: app_development
```

> Supabase Studio（管理UI）は http://localhost:54323 で開けます。

---

## 🐳 3. Run with Docker

アプリ全体を Docker Compose で起動します。

```bash
docker compose up --build
```

アクセス先一覧:
| Service | URL |
|----------|-----|
| Rails API | http://localhost:3000 |
| Frontend (Vite) | http://localhost:5173 |
| Supabase Studio | http://localhost:54323 |

---

## ⚙️ 4. Environment Variables

`.env` ファイルをルートに作成し、以下の内容を記載します。

```bash
DATABASE_URL=postgres://postgres:postgres@host.docker.internal:54322/app_development
DATABASE_URL_TEST=postgres://postgres:postgres@host.docker.internal:54322/app_test
```

> ※`host.docker.internal` は Docker コンテナからホスト上の Supabase へ接続するために使用します。

---

## ✅ 5. Verify Setup

```bash
# Check Supabase status
supabase status

# Check Rails health endpoint
open http://localhost:3000/health

# Run RSpec tests (inside backend container)
docker compose exec backend bundle exec rspec
```

---

## 🧩 Notes

- Supabaseの停止: `supabase stop`
- Dockerの停止: `docker compose down`
- DBリセット: `supabase db reset`
- フロント/バック両方をホットリロードしたい場合は `docker compose up` の代わりに `foreman start -f Procfile.dev` を検討。
