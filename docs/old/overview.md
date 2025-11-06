# Today’s Cocktail - プロジェクト概要

最終更新: 2025-11-06  
役割: プロジェクトの全体像・進行状況・関連ドキュメントを俯瞰できる「玄関口」。

---

## 1. プロダクトサマリ

- **カテゴリ**: カクテル検索 / レシピ学習 Web アプリ
- **ビジネス目的**: ポートフォリオ公開・実務トレーニング
- **提供価値**: ベース酒や材料から “今日の一杯” を提案し、初心者でも味わいや度数をイメージしやすくする
- **現在のマイルストーン** (2025-11-06時点): MVP 実装中（検索・詳細・お気に入り・認証を実装済み）

---

## 2. スコープと主要機能

| カテゴリ | 実装状況 | 備考 |
| --- | --- | --- |
| カクテル検索・一覧 | ✅ | ベース/材料検索・人気順ソート・ページネーション |
| カクテル詳細 | ✅ | 英日併記、材料リスト、作り方、説明、画像 |
| 今日の一杯 | ✅ | 日替わりキャッシュでランダム表示 |
| 認証 | ✅ | Devise + JWT、メール確認必須、`/users/me` |
| お気に入り | ✅ | 登録/一覧/削除、JWT 認証必須 |
| 管理者更新 | ✅ (API) | `/api/v1/admin/cocktails/:id` |
| 材料 API | ⏳ | 要件検討中 |
| 画像アップロード | ⏳ | 現在は URL 指定のみ |

---

## 3. アーキテクチャの一瞥

```
React (Vite) ── fetch ──> Rails API (JWT認証) ──> Supabase (PostgreSQL)
   |                           |
   |---- shadcn/ui ------------|---- Rails.cache / JWT Denylist

CI: GitHub Actions (lint / test)  
Infra: ローカルは Docker Compose。デプロイ先は Render (API) + Vercel (Front) を想定。
```

詳細は `docs/tech_stack.md`, `docs/api-design.md`, `docs/db_design.md` を参照。

---

## 4. ドキュメントマップ

| ドキュメント | 役割 |
| --- | --- |
| `docs/concept_design.md` | プロダクトのビジョン・価値・ペルソナ |
| `docs/functional_requirements.md` | 機能要件・ユースケース・非機能要件 |
| `docs/api-design.md` | REST API 仕様とレスポンス例 |
| `docs/db_design.md` | ERD・テーブル定義・制約 |
| `docs/wireframe.md` | 画面遷移・UI 構成・レスポンシブ指針 |
| `docs/tech_stack.md` | 採用技術とツールチェーン |
| `docs/old/` | 更新前ドキュメントのアーカイブ |

---

## 5. 現状の課題と次の一手

| 課題 | 状況 | 対応案 |
| --- | --- | --- |
| 画像の手動指定 | MVP では URL Override のみ | Active Storage or Supabase Storage 導入を検討 |
| 材料 API 未実装 | フロントの材料サジェスト要求あり | `/api/v1/ingredients` の設計とキャッシュ方針を決める |
| テイスティングノート不足 | 味のタグが未充実 | データ投入時に味わい情報を追加しフィルタを強化 |
| 自動デプロイ未整備 | GitHub Actions で lint/test のみ | Render/Vercel と連携するワークフローを構築 |

---

## 6. リリース計画（目安）

| フェーズ | 目標 | 期限（予定） |
| --- | --- | --- |
| Alpha (現状) | 基本機能で自己利用できる状態 | 2025-11 |
| Beta | 材料 API / 味タグ / 画像強化 | 2026-01 |
| Public | 作品集として一般公開 | 2026-03 |

---

## 7. コンタクト

- 作者: Akito  
- GitHub: https://github.com/iakito-dev/todays-cocktail  
- Figma: https://opt-mute-12091200.figma.site/

---

疑問点や仕様変更が出た場合は、この概要から関連ドキュメントへ辿って最新情報を確認すること。***
