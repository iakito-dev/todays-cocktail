# 技術選定（Tech Stack）

## 選定方針

1. **2025年現在も広く使われている技術であること**
　モダンな構成を採用し、学んだ内容が実務でも活かせるようにする。

2. **日本語情報が豊富で学習コストが低いこと**
　エラー対応や環境構築時に調べやすく、初学者でもキャッチアップ可能な技術を優先。

3. **企業での採用率・求人数が多いこと**
　転職・実務に直結する技術を重視し、ポートフォリオとしても有効な構成を選定。

---

## バックエンド：Ruby on Rails（APIモード）

**検討技術**：PHP / Laravel、Node.js / Express、Go / Echo

**採用理由**
- 日本語記事・教材が豊富で、RailsチュートリアルやProgateなど定番教材が揃っている。
- スタートアップやWeb企業での採用実績が多く、未経験からの転職例も多い。
- 文法がシンプルで、開発体験が快適。

**補助ツール**
- コード整形: RuboCop
- テスト: RSpec

---

## フロントエンド：TypeScript / React

**検討技術**：Hotwire、Next.js、Vue / Nuxt

**採用理由**
- Reactは2025年現在も採用率・学習資料ともに豊富。
- SPA構成によりユーザー体験を向上させる。
- HotwireはRailsネイティブだが、情報量・拡張性でReactを優先。
- Next.jsは高機能だが、学習リソースをバックエンドに集中させる目的で採用を見送り。
- TypeScriptにより型チェックが可能で、エラーを早期に検出できる。

**補助ツール**
- UIコンポーネント: shadcn/ui + Radix UI（Tailwindベース、Figmaと相性良好）
- コード整形: ESLint / Prettier
- テスト: Jest / React Testing Library
- CSS: Tailwind CSS

---

## データベース：Supabase（PostgreSQL）

**検討技術**：AWS RDS、Aurora、自前DB

**採用理由**
- 認証・ストレージなども統合されたMVP向けの構成。
- 個人開発レベルではコストが低く、学習・検証に適している。
- 将来的にRDSやAuroraへ移行可能な構造。
- 前職経験（AWS）を活かし、後にAWS環境への移行も見据える。

---

## 認証：Devise（Rails）

**検討技術**：Firebase Authentication、Auth0、Supabase Auth

**採用理由**
- Rails定番Gemであり、設定が容易。
- 公式ドキュメント・日本語情報が豊富。
- Firebaseなども検討したが、バックエンド理解を優先してDeviseを採用。

---

## インフラ / ホスティング：Render（Rails） + Vercel（React）

**検討技術**：Railway、Fly.io、AWS（ECS / RDS）

**採用理由**
- 無料プランあり、個人開発やポートフォリオに最適。
- RenderはRailsとの相性が良く、VercelはReactアプリのホスティングに最適。
- 将来的にAWSへ移行し、本番構成に近い環境を構築予定。

---

## CI / CD：GitHub Actions

**検討技術**：CircleCI

**採用理由**
- GitHub連携が容易で、YAMLで簡単に設定可能。
- 自動テスト・自動デプロイを効率的に導入できる。
- 無料枠が広く、個人開発でも十分運用可能。

---

## 開発環境：Docker / Docker Compose

**採用理由**
- 環境をコード化して再現性を確保。
- RailsとReactを一括起動でき、開発効率が高い。
- チーム開発にも対応しやすい構成。

---

## IaC：Terraform

**検討技術**：AWS CloudFormation、AWS CDK

**採用理由**
- インフラをコードで管理する練習として採用。
- マルチクラウド対応で、AWS以外にも応用可能。
- CloudFormation/CDKと比較し、汎用性が高く学習価値も大きい。

---

## テスト環境

| 対象 | フレームワーク | 備考 |
|------|----------------|------|
| バックエンド | RSpec | Rails定番構成 |
| フロントエンド | Jest / React Testing Library | ユニット・UIテスト |

---

## 最終構成まとめ

| 分類 | 採用技術 | 補足 |
|------|------------|------|
| バックエンド | Ruby / Rails | APIモード、RuboCop + RSpec |
| フロントエンド | TypeScript / React | SPA構成、shadcn/ui採用 |
| データベース | Supabase (PostgreSQL) | MVP向けクラウドDB |
| 認証 | Devise | Rails標準Gem |
| インフラ | Render / Vercel / AWS | 学習・本番両対応 |
| CI/CD | GitHub Actions | 自動テスト・デプロイ |
| 開発環境 | Docker / Docker Compose | 再現性確保 |
| IaC | Terraform | AWS移行を見据えた構成 |
| テスト | RSpec / Jest | 定番フレームワーク |
