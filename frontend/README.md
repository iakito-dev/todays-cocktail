# Today's Cocktail Frontend

React + TypeScript + Vite で構築されたカクテル検索アプリケーションのフロントエンド

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example`を参考に`.env`ファイルを作成してください。

```bash
cp .env.example .env
```

必須の環境変数:

- `VITE_API_BASE_URL`: バックエンドAPIのベースURL（例: `http://localhost:3000`）

### 3. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

## ディレクトリ構造

```
frontend/
├── src/
│   ├── components/          # 共通コンポーネント
│   │   ├── common/         # 汎用コンポーネント（ImageWithFallback等）
│   │   ├── layout/         # レイアウトコンポーネント（Header, Footer, Seo）
│   │   └── ui/             # shadcn/uiコンポーネント（Button, Dialog等）
│   ├── contexts/           # React Context（AuthContext）
│   ├── features/           # 機能別モジュール
│   │   ├── account/        # アカウント設定
│   │   ├── auth/           # 認証（ログイン・サインアップ・パスワードリセット）
│   │   ├── cocktails/      # カクテル機能
│   │   │   ├── components/ # カクテル関連コンポーネント
│   │   │   │   ├── detail/ # 詳細表示コンポーネント
│   │   │   │   └── list/  # 一覧表示コンポーネント
│   │   │   ├── hooks/      # カクテル検索フック
│   │   │   └── pages/      # カクテル詳細ページ
│   │   └── todays-pick/    # 今日の一杯機能
│   ├── hooks/              # 共通カスタムフック（useAuth, useFavorites, useDebounce）
│   ├── lib/                 # ユーティリティ・APIクライアント
│   │   ├── api.ts          # API呼び出し関数
│   │   ├── types.ts        # TypeScript型定義
│   │   ├── utils.ts        # ユーティリティ関数
│   │   └── seo.ts          # SEO関連設定
│   ├── test/               # テスト設定
│   ├── App.tsx             # メインアプリケーションコンポーネント
│   ├── main.tsx            # エントリーポイント
│   └── index.css           # グローバルスタイル
├── public/                 # 静的ファイル（favicon, OGP画像等）
├── scripts/                # ビルドスクリプト
└── vite.config.ts          # Vite設定
```

## 技術スタック

- **React 19**: UIライブラリ
- **TypeScript**: 型安全性
- **Vite 7**: ビルドツール・開発サーバー
- **React Router 7**: ルーティング
- **Tailwind CSS 3**: ユーティリティファーストCSS
- **shadcn/ui**: UIコンポーネントライブラリ（Radix UIベース）
- **Vitest**: テストフレームワーク
- **ESLint + Prettier**: コード品質・フォーマット

## 主要機能

### カクテル検索・一覧表示

- キーワード検索
- ベース種類・技法・強度でのフィルタリング
- 人気順ソート
- ページネーション

### カクテル詳細

- カクテル情報の詳細表示
- 材料・レシピの表示
- お気に入り追加（ログイン必須）

### 認証機能

- ユーザー登録・ログイン
- メール確認
- パスワードリセット
- JWT認証

### お気に入り機能

- お気に入り一覧表示
- お気に入り追加・削除
- お気に入りパネル（サイドシート）

### 今日の一杯

- 日替わりでカクテルをレコメンド
- ローカルストレージで表示状態を管理

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# プレビュー（ビルド後の確認）
npm run preview

# Lint実行
npm run lint

# Lint自動修正
npm run lint:fix

# フォーマット
npm run format

# フォーマットチェック
npm run format:check

# テスト実行
npm run test

# テストUI起動
npm run test:ui

# テストカバレッジ
npm run test:coverage

# サイトマップ生成
npm run sitemap
```

## コード分割

ルートレベルでコード分割を実装し、初期ロード時間を短縮しています。

```typescript
// App.tsx
const CocktailDetail = lazy(() =>
  import('./features/cocktails/pages/CocktailDetail').then((m) => ({
    default: m.CocktailDetail,
  })),
);
```

## パフォーマンス最適化

- **コード分割**: ルートレベルでの遅延読み込み
- **画像最適化**: `ImageWithFallback`コンポーネントでフォールバック処理
- **デバウンス**: 検索入力のデバウンス処理（`useDebounce`フック）
- **メモ化**: `useCallback`、`useMemo`で不要な再レンダリングを防止

## テスト

Vitestを使用してコンポーネントとフックのテストを実装しています。

```bash
# テスト実行
npm run test

# カバレッジ確認
npm run test:coverage
```

テストファイルは各機能ディレクトリの`__tests__`フォルダまたは`.test.tsx`ファイルに配置されています。

## SEO対策

- `react-helmet-async`を使用したメタタグ管理
- 構造化データ（JSON-LD）の実装
- OGP画像の設定
- サイトマップの自動生成

## デプロイ

Vercelに自動デプロイされます。`main`ブランチへのプッシュで自動的にビルド・デプロイが実行されます。

## 関連ドキュメント

- [バックエンドREADME](../backend/README.md)
- [プロジェクト全体README](../README.md)
