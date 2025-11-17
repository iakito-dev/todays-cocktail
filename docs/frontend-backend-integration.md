# 実装機能の概要

## 1. システム全体像

- **バックエンド**: Rails API（`backend/`）。Devise + JWT 認証、Rails.cache による応答キャッシュ、外部 API（TheCocktailDB / OpenAI / DeepL / Unsplash）連携でデータを拡充。
- **フロントエンド**: Vite + React（`frontend/`）。shadcn/ui をベースにした UI コンポーネントと Context + Hooks で状態管理。API 通信は `src/lib/api.ts` に集約。
- **データモデル**: `Cocktail` / `Ingredient` / `CocktailIngredient` / `Favorite` / `User`。カクテル情報は日本語フィールドと画像 URL（`image_url_override`）を保持。
- **開発時のベース URL**: `VITE_API_BASE_URL` 未設定時は `http://localhost:3000` を想定（`frontend/src/lib/api.ts`）。

## 2. バックエンド API 概要

### 2.1 認証・ユーザー系

| エンドポイント         | メソッド | 認証 | 役割                                                               | 主なレスポンス                                |
| ---------------------- | -------- | ---- | ------------------------------------------------------------------ | --------------------------------------------- |
| `/api/v1/signup`       | POST     | 不要 | ユーザー登録。メール確認必須のため自動ログインなし。               | `status`, `data.user`（confirmed フラグ含む） |
| `/api/v1/login`        | POST     | 不要 | ログイン。Devise JWT が `Authorization` ヘッダー（Bearer）で返却。 | `status`, `data.user`                         |
| `/api/v1/logout`       | DELETE   | 要   | トークンを denylist に登録し無効化。                               | 成功メッセージのみ                            |
| `/api/v1/confirmation` | GET/POST | 不要 | メール確認・再送。GET は確認トークンを検証し自動ログイン。         | `data.user` またはエラー                      |
| `/api/v1/users/me`     | GET      | 要   | 現在のユーザー情報を返却。                                         | `data.user`                                   |

認証チェックは `ApplicationController#authenticate_user!`（`backend/app/controllers/application_controller.rb`）で JWT を検証し、denylist（`JwtDenylist`）で失効判定する。

### 2.2 カクテル系

| エンドポイント                  | メソッド | 認証 | 役割                                                                                                                                                     | キャッシュ                                      |
| ------------------------------- | -------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| `/api/v1/cocktails`             | GET      | 任意 | 一覧取得。`q`（名前検索）、`base`（enum 複数可）、`ingredients`（AND 検索）、`sort`（`popular`）などをサポート。ページネーションは `page` / `per_page`。 | Rails.cache で 1 時間（パラメータ別にキー生成） |
| `/api/v1/cocktails/:id`         | GET      | 任意 | 詳細取得。材料配列・日本語訳・表示用画像 URL を含む。                                                                                                    | Rails.cache で 24 時間                          |
| `/api/v1/cocktails/todays_pick` | GET      | 任意 | 当日のおすすめをランダム表示。                                                                                                                           | Rails.cache で 1 日（`todays_pick_YYYY-MM-DD`） |

### 2.3 お気に入り・管理者系

| エンドポイント                | メソッド | 認証   | 役割                                                                                      |
| ----------------------------- | -------- | ------ | ----------------------------------------------------------------------------------------- |
| `/api/v1/favorites`           | GET      | 要     | ログインユーザーのお気に入り一覧を最新順で返却。                                          |
| `/api/v1/favorites`           | POST     | 要     | `cocktail_id` をお気に入り登録。重複登録はバリデーションで防止。                          |
| `/api/v1/favorites/:id`       | DELETE   | 要     | お気に入り削除。                                                                          |
| `/api/v1/admin/cocktails/:id` | PUT      | 管理者 | カクテル情報（各種フィールドや `image_url_override`）を更新。キャッシュを明示的に無効化。 |

## 3. バックエンドのサービス層・バッチ処理

- `TranslationService`（`backend/app/services/translation_service.rb`）
  OpenAI Chat Completions（`gpt-4o-mini`）で日本語訳や説明文を生成。429 エラー時は DeepL API にフォールバック。材料翻訳はバッチプロンプトで効率化。ベース／度数推定もプロンプトで実施。

- `ImageDownloadService`（`backend/app/services/image_download_service.rb`）
  外部 URL の画像をダウンロードし Active Storage に添付する設計。現在は Active Storage テーブルを削除しているため（`20251104232712_drop_active_storage_tables.rb`）、`image_url_override` の URL をそのままフロントで利用する運用が基本。将来的に再導入する場合は `has_one_attached :image` をモデルに追加する。

- `UnsplashImageService`（`backend/app/services/unsplash_image_service.rb`）
  Unsplash API でカクテル画像を検索し、`image_url_override` に格納。レート制限（50 req/hour）を考慮し 2 秒スリープ、ダウンロード通知 API も呼び出す。

- Rake タスク（`backend/lib/tasks/`）
  - `cocktails:import`（`import_cocktails.rake`）: TheCocktailDB API 全件インポート。翻訳・日本語フィールドの保存、材料翻訳、画像ダウンロードまでを一括で実施。
  - `cocktails:import_popular`（`import_popular_cocktails.rake`）: 人気リストを順次取り込み、欠損画像・翻訳を補完。
  - `cocktails:translate_all`: 既存カクテル・材料・分量・レシピを後付け翻訳。
    各処理で API 負荷を下げるための `sleep` が明示されており、エラーはロギング＋カウントで要約される。

## 4. フロントエンドの UI コンポーネントと状態管理

- `CocktailList`（`frontend/src/components/CocktailList.tsx`）
  - クエリパラメータを `useDebounce`（ローカル実装）で最適化し、`fetchCocktails` の結果をセッションストレージにキャッシュ（キーは検索条件＋ページ＋並び替え）。
  - shadcn/ui の `Tabs` により「すべて／お気に入り」を切替。お気に入りタブは `useFavorites` が保持するローカル状態をページング表示。
  - 詳細ダイアログを開く際は `fetchCocktail`（詳細 API）を呼び出して材料などを取得。失敗時は一覧の最小情報でフォールバック。

- `TodaysPick`（`frontend/src/components/TodaysPick.tsx`）
  - `/api/v1/cocktails/todays_pick` を呼び出し、日付単位でセッションストレージにキャッシュ。
  - 取得失敗時はエラーメッセージ表示のみで副作用なし。

- `useFavorites`（`frontend/src/hooks/useFavorites.ts`）
  - JWT トークンの存在をチェックし、なければエラートースト（`sonner`）で通知。
  - POST 成功時はレスポンスのカクテルを即時反映し、重複時は既存エントリを更新。DELETE はローカル配列から削除。

- `AuthProvider` / `useAuth`（`frontend/src/contexts/AuthContext.tsx`）
  - ローカルストレージの JWT を起動時に検証し、有効なら `/api/v1/users/me` でユーザー情報をフェッチ。
  - `login` 成功でユーザー情報更新、`signup` は確認メール送信まででログインは行わない方針。
  - `AuthDialog` はログイン／登録フォームを提供し、`AuthProvider` の `login` / `signup` を呼び出す。

- `CocktailDetailDialog` + `EditCocktailDialog`
  - 詳細ダイアログはお気に入りトグルを透過させ、管理者の場合のみ編集モーダルを開く。
  - 編集確定時は `updateCocktail`（PUT `/api/v1/admin/cocktails/:id`）を呼び出し、セッションキャッシュを無効化して最新データを再取得。

## 5. 主なデータフロー

1. **一覧表示（非ログイン）**
   フロントが `/api/v1/cocktails` を呼び出し（`fetchCocktails`）、Rails 側でパラメータに基づくフィルタリングとページングを実施。レスポンスには `meta`（全件数・ページ情報）と、`display_image_url`（`image_url_override` の値）が含まれる。結果はフロント側で 1 セッション中キャッシュされ、同一条件の再検索を短縮。

2. **詳細表示**
   `CocktailCard` クリックで `fetchCocktail` を発火。Rails 側は `includes` で `ingredients` を eager load し、材料配列・日本語訳・説明文を JSON 化。結果は 24 時間キャッシュ＋フロントのセッションストレージに保存。

3. **お気に入りトグル**
   - ログイン済み: `useFavorites.addFavorite` が POST `/api/v1/favorites` を実行し、成功レスポンスを即時反映。削除は DELETE `/api/v1/favorites/:id`。
   - 未ログイン: `CocktailList` 側で `AuthDialog` を表示し、ログイン成功後に `fetchFavorites` で初期同期。

4. **管理者編集**
   `EditCocktailDialog` から PUT `/api/v1/admin/cocktails/:id`。バックエンドは更新後に関連キャッシュキー（一覧／詳細／今日のおすすめ）を削除。フロントはセッションキャッシュを全削除してリストも更新。

5. **バッチによるデータ更新**
   Rake タスクで TheCocktailDB → 翻訳 → 画像 URL 取り込みを完結し、必要に応じて `ImageDownloadService` でローカル保存。これによりバックエンド API から提供されるデータ（日本語名、説明、材料）が最新化され、フロントは再デプロイなしで恩恵を受ける。

## 6. キャッシュとパフォーマンス最適化

- **バックエンド**
  - 一覧・詳細・今日のおすすめを Rails.cache で短期キャッシュ。インポート直後や管理画面更新時はキーを削除して反映を即時化。
  - 翻訳／画像取得時に `sleep` を挟み、外部 API のレート制限に配慮。

- **フロントエンド**
  - 一覧・詳細・今日のおすすめをセッションストレージにキャッシュ。クエリが変わるとページ番号をリセットし、同一セッション中の API 呼び出しを削減。
  - 入力は 300ms デバウンスで API 呼び出し頻度をコントロール。
  - `useFavorites` は変化差分のみを更新し UI 反映を高速化。

## 7. 保守・改善のヒント

- 新しいデータ更新系タスクを追加する際は既存の翻訳・画像サービスを再利用し、Active Storage を再び使う場合は `Cocktail` モデルに添付定義とテーブル復活マイグレーションを行う。
- shadcn/ui コンポーネントのカスタマイズは `frontend/src/components/ui/` 配下で行う。共通 UI の再利用性が高いため、新規画面もこのパターンを踏襲する。
- API レスポンスへフィールドを追加する際は、Rails のキャッシュキーにパラメータが含まれているかを確認し、フロントのキャッシュ削除ロジック（`updateCocktail` 内など）も調整する。
- フロントの状態管理は Context + Hooks による軽量構成。複雑さが増した場合は Zustand 等の導入を検討できるが、現状は shadcn/ui + Hooks で十分に把握可能。
- バッチ処理後は `/api/v1/cocktails` のキャッシュ期間（1 時間）が切れるまで古いデータが返る可能性があるため、必要に応じて `Rails.cache.clear` などで明示的にリフレッシュする。
