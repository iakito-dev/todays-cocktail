# Today's Cocktail　- アプリ紹介

## サービス概要

Today's Cocktail は、「カクテルをもっと身近に」という思いから生まれたカクテルレシピ検索サービスです。  
ベース種類・材料・人気順など複数の軸でレシピ検索ができ、気に入った一杯はお気に入りとして保存できます。  
視覚的にわかりやすい画像と直感的な UI により、初心者でも安心して新しいカクテルに出会える体験を提供します。

<img width="1200" height="630" alt="ogp_img" src="https://github.com/user-attachments/assets/f07884a7-66ee-484b-a2d6-d77410a86c90" />

### URL

https://todayscocktails.com


### ゲストユーザーアカウント
- Email: guestuser@example.com  
- Password: password123

### サービス開発の背景

海外のバーでドリンクを選ぶとき、名前だけでは味や見た目が想像できないカクテルがずらっと並び、注文に苦戦したことがアプリ開発のきっかけです。日本ではハイボールやレモンサワーが定番ですが、海外ではそういったメニューはほとんど存在せず、さらにメニューに写真が載っていないことも多いため、よく分からない名前だけを頼りに適当に注文してしまうことがよくありました。困ったときはワインやビールを頼めば済むものの、せっかくなら幅広い種類のカクテルにも詳しくなり、自分でも自信を持ってバーで注文できるようになりたいと感じ、初心者向けのカクテル図鑑のようなアプリをつくりたいと感じました。本アプリでは、このような開発者自身の体験をもとに、初心者でも直感的に雰囲気が分かる画像や、カクテルの起源・由来・アルコール度数などの情報を分かりやすく整理し、安心して新しい一杯を選べることを目指しています。


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
| バックエンド API | Ruby 3.4.6 / Rails 8.0.3（API モード） |
| データベース | Supabase CLI / Cloud（PostgreSQL 17） |
| 認証 | Devise / devise-jwt |
| 外部API連携 | OpenAI API（生成・翻訳） / TheCocktailDB API（カクテル情報） / Unsplash API（画像） / Resend API（メール送信） |
| インフラ・ホスティング | Vercel（フロントエンド） / Render（バックエンド API） / Cloudflare DNS |
| CI/CD | GitHub Actions（lint / test） / Vercel & Render Deploy Hooks |
| テスト | Vitest 4（フロント） / RSpec（Rails API） |
| UI/UX デザイン | Figma / Figma Make |
| 開発支援・コード整形 | ESLint 9 / Prettier 3 / Husky 9 / lint-staged 16 / RuboCop |
| 開発環境 | Git / Docker / Docker Compose / VS Code / GitHub Copilot / Codex（Sonnet 4.5 / gpt-5 / gpt-5-codex） / Colima（軽量Docker環境） |


詳しい選定理由は `docs/tech_stack.md` に記載。

---

## 構成図

## インフラ構成

```mermaid
flowchart LR
  User[ユーザー] -->|HTTPS| Cloudflare[Cloudflare DNS]
  Cloudflare --> Vercel[Vercel<br/>(React SPA)]
  Cloudflare --> Render[Render<br/>(Rails API)]
  Render --> Supabase[(Supabase Cloud<br/>PostgreSQL)]
  Render --> Cache[RAILS.cache / Redis（検討中）]
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

テーブル定義の詳細は `docs/db_design.md` に記載。

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

UI とレスポンシブ方針は `docs/wireframe.md` に記載。

---

## 技術選定理由（抜粋）

- **Rails 8 (API モード)**  
  他のバックエンドフレームワークと比較して日本語の学習教材や導入事例が豊富である点が採用理由です。本プロジェクトはポートフォリオとしての活用も想定していたため、スタートアップ企業や未経験・ジュニア層での採用実績が比較的多い Ruby を選択しました。

- **React + Vite + TypeScript**  
  もともと JavaScript を学習していたことに加え、日本語の教材や採用実績が豊富で、現在主流のフロントエンド開発手法に合致している点から採用しました。Next.js も検討しましたが、Ruby と併用する場合は学習範囲が広がり負荷が増える可能性があること、また本プロジェクトでは複雑な要件が特にないため、よりシンプルに扱える React を選択しました。

- **Render / Vercel / Cloudflare**  
  当初は前職で使用経験のある AWS も検討しましたが、フロントとバックエンドでそれぞれ ECS Fargate を運用し、RDS を配置する構成では、最小スペックでも月額 6,000〜10,000 円ほどのコストが発生する見込みでした。個人開発として長く運用したいことから、低コストかつ小〜中規模アプリ向けの機能が充実している Render・Vercel・Cloudflare を組み合わせる構成を選択しました。

- **Supabase Cloud**  
  同様にコスト面を考慮し、無料で簡単に PostgreSQL 環境をデプロイできる点を評価しました。前職では MySQL の利用経験が中心でしたが、Supabase が PostgreSQL に特化していること、そして今後さらにシェアが伸びると見込まれる PostgreSQL を学習する良い機会になると考え採用しました。


---

## 工夫した点

- カクテル一覧、詳細、検索機能におけるパフォーマンス向上

- AIを活用した材料やレシピなどのコンテンツ生成

- なるべくシンプルでわかりやすいUIUXの実装

---

## 苦労した点

- 認証機能の実装

- Lint、自動テストなど開発環境の整備

---

## 今後の開発ロードマップ

- カクテル画像アップロード機能の実装（現在は外部URLのみ取得）
- 「定番」「簡単」などのタグ付け機能の追加、およびフィルタリング項目への反映
- ソーシャルログイン機能（LINE / Google など）の導入
- コメント投稿機能の追加
- カクテルレシピの拡充
- プレミアムユーザー向け機能（課金）の導入


---


- Akito（iakito-dev）
- GitHub: https://github.com/iakito-dev
- Figma プロトタイプ: https://opt-mute-12091200.figma.site/

設計からデプロイまで一通り手を動かした経験を整理するために育てているプロジェクトです。感想や改善アイデアなどあればぜひお知らせください。
