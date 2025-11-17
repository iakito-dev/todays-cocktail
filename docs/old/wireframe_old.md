# 画面設計・ワイヤーフレーム（UI Design & Wireframe）

## トップページ（Home）

- ページ上部に「本日の一杯（ランダム表示）」を掲載
- 下部にはカクテルの一覧リストを表示
- 左サイドバーには、ベースやアルコール度数などの検索・フィルタリング機能を配置

![Top Page](https://github.com/user-attachments/assets/65fdcb05-6be0-4a44-a582-90d8c7d0b7a6)

---

## カクテル詳細ページ（Cocktail Detail）

- カクテル名、タグ（ベース・アルコール度数）、お気に入りアイコンを上部に表示
- 写真・グラス・技法を視覚的に配置し、見やすいデザインを採用

![Cocktail Detail](https://github.com/user-attachments/assets/1d39cc7d-f6bc0-4837-9742-7b9e97346416)

- 下部に以下のセクションを表示：
  - 材料（Ingredients）
  - レシピ（How to make）
  - 一言メモ（Notes）

![Recipe Section](https://github.com/user-attachments/assets/a1c1ac2a-6334-4245-a552-22c1f5cfccfa)

---

## ベース別フィルタリング（Base Filter）

- ジン、ラム、ウイスキー、ウォッカなど、ベース酒を選択して絞り込み可能
- 結果は一覧形式で表示され、ビジュアル的にもわかりやすい

![Base Filter](https://github.com/user-attachments/assets/d6694896-b305-4479-8cce-2cbaf6aee446)

---

## お気に入り機能（Favorites）

- 気に入ったカクテルをお気に入り登録可能
- 登録にはユーザー認証（ログイン）が必要

![Favorites](https://github.com/user-attachments/assets/072d9342-9c3f-42ea-82e8-71767e34606c)

---

## ユーザー登録・ログイン

### 新規登録ページ（Sign Up）

- 名前、メールアドレス、パスワードでアカウント作成
- シンプルで直感的なUI

![Sign Up](https://github.com/user-attachments/assets/f92d0aad-fa72-42fb-a28d-10fe8f4a44ee)

### ログインページ（Sign In）

- 登録済みユーザーはここからログイン
- Deviseを使用した認証を実装予定

![Login](https://github.com/user-attachments/assets/4dec9f75-2747-46a6-88a3-9d13fdec0ba1)

---

## フッター（Footer）

- サイト名、利用規約、SNSリンクなどを配置
- 落ち着いたトーンで全体デザインを統一

![Footer](https://github.com/user-attachments/assets/17b9f0f1-cbcd-4727-b07b-86ee1629a9b3)

---

## レスポンシブ対応（Responsive Design）

- モバイル表示時は、縦スクロール中心の構成に自動調整
- Tailwind CSSを用いてレスポンシブデザインを実装予定

![Responsive](https://github.com/user-attachments/assets/41105c98-796d-4094-b1d4-d5952f133aae)

---

## Figmaプロトタイプ

Figmaで作成したプロトタイプはこちらから閲覧可能：
URL: [https://opt-mute-12091200.figma.site/](https://opt-mute-12091200.figma.site/)

---

## ファイル出力

最終成果物は以下として保存予定：
`docs/wireframe.png`
