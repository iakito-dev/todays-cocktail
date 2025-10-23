## 🧰 Development Setup（仮）

### Requirements
- asdf 0.18.0+
- Ruby 3.4.6
- Node.js 22.21.0
- Yarn 1.22.22
- Docker Desktop

### Setup

```bash
git clone https://github.com/iakito-dev/todays-cocktail.git
cd todays-cocktail
asdf install
cd backend && bundle install
cd ../frontend && yarn install
docker compose up -d
```
