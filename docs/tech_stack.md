# 技術選定（Tech Stack）

最終更新: 2025-11-06  
対象リポジトリ: `iakito-dev/todays-cocktail`

---

## 1. 全体構成の俯瞰

| レイヤー | 採用技術 | 役割 |
| --- | --- | --- |
| フロントエンド | React 19 + TypeScript + Vite | SPA として API を操作。React Router で画面遷移。 |
| バックエンド API | Ruby 3.4.6 / Rails 8.0.3 (API mode) | RESTful API + Devise 認証 + キャッシュ管理。 |
| データベース | Supabase（PostgreSQL 15 系） | 本番/開発ともにマネージド PostgreSQL。 |
| 認証 | Devise + devise-jwt | メール確認付きユーザー登録と JWT ベースのセッション管理。 |
| インフラ | Docker Compose（ローカル） / Render (Rails) / Vercel (React) | ローカル開発と将来のホスティングを分離。 |
| CI/CD | GitHub Actions | lint / test / build を自動化。 |
| IaC | Terraform | 将来的な AWS 等への移行を見据えたコード化。 |

---

## 2. バックエンド（Rails API）

- **主要ライブラリ**
  - `devise`, `devise-jwt`: ユーザー登録・ログイン、JWT 発行/失効。
  - `rack-cors`: フロントエンドからのクロスドメインアクセス許可。
  - `active_model_serializers` は未使用。レスポンスはコントローラで直接構築。
  - `rspec-rails`, `factory_bot_rails`, `shoulda-matchers`: リクエストスペック中心のテスト。
- **アーキテクチャ**
  - API モード（`ActionController::API`）で構築し、ビューやセッションを排除。
  - JWT denylist を独自テーブル `jwt_denylists` で管理。
  - カクテル一覧/詳細/今日の一杯に対し Rails.cache を活用。
  - ActiveAdmin 等の GUI は未導入。管理者更新は API 経由。
- **環境**
  - `docker compose` 経由で `backend` コンテナを起動。
  - Supabase が提供する PostgreSQL を DATABASE_URL で参照。

---

## 3. フロントエンド（React + Vite）

- **主要ライブラリ**
  - React 19, React Router 7（`react-router-dom`）でページ遷移。
  - UI: Tailwind CSS + shadcn/ui（Radix UI ベース）+ lucide-react アイコン。
  - 状態管理: React Hooks + Context（最小構成）。将来拡張に備えて Zustand などは未導入。
  - テスト: Vitest + Testing Library。`vitest.config.ts` で JSDOM を使用。
- **ビルド/開発環境**
  - Vite 7 を使用し、`yarn dev` でポート 5173 を起動。
  - ESLint 9 系 + @typescript-eslint + Prettier による静的検査。
  - Tailwind 設定は `tailwind.config.ts`、shadcn の `components.json` を併用。
- **API 連携**
  - `VITE_API_URL` を環境変数から読み込み、Fetch API で Rails をコール。
  - JWT は `Authorization` ヘッダーで送受信し、ログアウト時に破棄。

---

## 4. データベース / ストレージ

- Supabase のローカルホスト（`supabase start`）またはクラウド環境を利用。
- PostgreSQL 拡張（`uuid-ossp`, `pg_stat_statements` 等）は Supabase 側で有効化済み。
- Rails 側は `config/database.yml` で `DATABASE_URL` を参照し、環境変数で切り替え。
- マイグレーションは Rails 標準。Active Storage は現時点で未使用（画像は URL 参照）。

---

## 5. 認証・セキュリティ

- Devise confirmable によるメール確認必須フロー。
- devise-jwt で `Authorization: Bearer <token>` を発行し、`jwt_denylists` に JTI を保存。
- CORS 設定でフロントエンドのオリジンを許可し、`Authorization` ヘッダーを expose。
- HTTPS 固定はホスティング側（Render / Vercel）で対応予定。

---

## 6. インフラ / デプロイ戦略

- **ローカル開発**: Docker Compose で `backend`, `frontend`, `supabase` サービスを起動。
- **クラウド想定**
  - Rails API: Render（Docker デプロイ）を想定。環境変数で Supabase を参照。
  - フロントエンド: Vercel の静的ホスティング（`vite build` 産物をデプロイ）。
  - Supabase: 本番用プロジェクトを想定（マネージド Postgres + Auth + Storage）。
- **IaC**: Terraform で AWS 等へ移行できるようリソーステンプレートを整備中。

---

## 7. 開発プロセス & ツールチェーン

- **バージョン管理**: GitHub。main ブランチで開発中。
- **CI/CD**: GitHub Actions（lint / test / build をジョブ化予定）。
- **コード品質**
  - Rails: `bundle exec rubocop`（omakase 設定）。
  - React: ESLint + Prettier、Vitest でユニットテスト。
- **ドキュメンテーション**
  - `docs/` ディレクトリで API、DB、設計資料を管理。
  - Figma (https://opt-mute-12091200.figma.site/) に UI プロトタイプを配置。

---

## 8. 採用しなかった技術と理由（抜粋）

| 技術 | 不採用理由 |
| --- | --- |
| Next.js | SSR/SSG が必要な要件ではなく、学習対象を Rails + React に集中するため。 |
| Firebase Auth | Devise と要件が重複し、Rails 側でロジックを完結させたかった。 |
| Prisma | Rails ActiveRecord で十分なため。ORM を二重に持たない方針。 |
| GraphQL | REST で要件を満たせており、学習負荷を抑えるため採用せず。 |

---

## 9. 今後の技術的チャレンジ

1. **E2E テスト**: Playwright を導入し、React ↔ Rails の結合テストを自動化したい。  
2. **Monitoring**: Render/Vercel にデプロイ後、Sentry + Logflare でエラートラッキング。  
3. **Infrastructure Hardening**: Terraform で AWS (ECS + RDS + CloudFront) へのデプロイパスを整備。  
4. **リアルタイム機能**: Supabase Realtime を使ったコメント機能などを検討。  
5. **パフォーマンス改善**: Rails キャッシュ戦略を Redis に移行する検討。

---

このドキュメントはリポジトリの設定と同期するよう更新し、変更時は最終更新日を修正すること。***
