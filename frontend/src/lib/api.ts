/**
 * APIクライアント
 * Rails APIバックエンドとの通信を行うためのユーティリティ関数
 */
import type { Cocktail } from './types';

// API BaseURL設定
// 環境変数VITE_API_BASE_URLから取得、未設定時はローカル開発環境をデフォルトとする
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
const DETAIL_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7日

function extractErrorMessage(
  method: string,
  path: string,
  status: number,
  bodyText: string | null,
): string {
  if (bodyText) {
    try {
      const data = JSON.parse(bodyText);
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        return data.errors.join(', ');
      }
      if (typeof data.error === 'string' && data.error.trim().length > 0) {
        return data.error.trim();
      }
      if (data.status?.message) {
        return String(data.status.message);
      }
      if (typeof data.message === 'string' && data.message.trim().length > 0) {
        return data.message.trim();
      }
    } catch {
      if (bodyText.trim().length > 0) {
        return bodyText.trim();
      }
    }
  }
  return `${method} ${path} failed: ${status}`;
}

/**
 * 認証トークンを取得
 */
function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

/**
 * 認証トークンを保存
 */
export function setAuthToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

/**
 * 認証トークンをクリア
 */
export function clearAuthToken(): void {
  localStorage.removeItem('auth_token');
}

/**
 * 認証ヘッダーを取得
 */
function getAuthHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * GETリクエストを送信する
 * @param path - APIエンドポイントのパス（例: "/api/users", "/health"）
 * @param init - 追加のfetchオプション（オプショナル）
 * @returns レスポンスのJSONデータ
 * @throws {Error} リクエストが失敗した場合
 */
export async function apiGet(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    ...init, // カスタムヘッダーやその他のオプションをマージ
  });

  // レスポンスステータスが200番台以外の場合はエラー
  if (!res.ok) {
    const text = await res.text();
    throw new Error(extractErrorMessage('GET', path, res.status, text));
  }

  // JSONパースに失敗した場合は空オブジェクトを返す
  return res.json().catch(() => ({}));
}

/**
 * 公開エンドポイント用のGET（Authorizationヘッダーを付与しない）
 * 共有キャッシュ/CDNのヒット率を高めるため、未ログイン時だけでなく
 * ログイン中でも明示的にこの関数を使う
 */
export async function apiGetPublic(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    ...init,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(extractErrorMessage('GET', path, res.status, text));
  }

  return res.json().catch(() => ({}));
}

/**
 * POSTリクエストを送信する
 * @param path - APIエンドポイントのパス
 * @param body - リクエストボディ
 * @param init - 追加のfetchオプション
 * @returns レスポンスのJSONデータ
 * @throws {Error} リクエストが失敗した場合
 */
export async function apiPost(
  path: string,
  body?: unknown,
  init?: RequestInit,
) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
    ...init,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(extractErrorMessage('POST', path, res.status, text));
  }

  return res.json().catch(() => ({}));
}

/**
 * 認証用POSTリクエスト（レスポンスヘッダーも返す）
 * 認証エンドポイント（login/signup）専用の内部ヘルパー関数
 * @param path - APIエンドポイントのパス
 * @param body - リクエストボディ
 * @returns レスポンスのJSONデータとAuthorizationヘッダー
 * @throws {Error} リクエストが失敗した場合
 */
async function apiPostAuth(
  path: string,
  body: unknown,
): Promise<{ data: AuthResponse; token: string | null }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    // エラーレスポンスを取得（一度だけ読み取る）
    let errorMessage = `POST ${path} failed: ${res.status}`;
    try {
      const text = await res.text();
      // JSONとしてパース試行
      try {
        const errorData = JSON.parse(text);
        // バックエンドからのエラーメッセージを取得
        if (
          errorData.errors &&
          Array.isArray(errorData.errors) &&
          errorData.errors.length > 0
        ) {
          errorMessage = errorData.errors.join(', ');
        } else if (errorData.status?.message) {
          errorMessage = errorData.status.message;
        }
      } catch {
        // JSONパースに失敗した場合はテキストをそのまま使用
        if (text) {
          errorMessage = text;
        }
      }
    } catch {
      // レスポンス読み取り失敗時はデフォルトメッセージ
    }
    throw new Error(errorMessage);
  }

  const token = res.headers.get('Authorization');
  const data = await res.json().catch(() => ({}));
  return { data, token };
}

/**
 * ヘルスチェック - APIサーバーの疎通確認
 * @returns Promise<string> サーバーからのレスポンス
 */
export async function fetchHealth(): Promise<string> {
  const res = await fetch(`${BASE_URL}/health`);
  return res.text();
}

/**
 * カクテル一覧を取得
 */
export interface CocktailQuery {
  q?: string;
  base?: string | string[]; // enum key(s)
  ingredients?: string; // comma/space separated
  page?: number;
  per_page?: number;
  sort?: 'id' | 'popular';
}

export interface CocktailsResponse {
  cocktails: Cocktail[];
  meta: {
    current_page: number;
    per_page: number;
    total_count: number;
    total_pages: number;
  };
}

export async function fetchCocktails(
  params?: CocktailQuery,
): Promise<CocktailsResponse> {
  const qs = new URLSearchParams();
  if (params) {
    if (params.q) qs.set('q', params.q);
    if (params.ingredients) qs.set('ingredients', params.ingredients);
    if (params.page) qs.set('page', params.page.toString());
    if (params.per_page) qs.set('per_page', params.per_page.toString());
    if (params.sort) qs.set('sort', params.sort);
    if (params.base) {
      const bases = Array.isArray(params.base)
        ? params.base
        : params.base.split(',');
      if (bases.length === 1) {
        qs.set('base', bases[0]);
      } else if (bases.length > 1) {
        bases.forEach((b) => qs.append('base[]', b));
      }
    }
  }
  const path = `/api/v1/cocktails${qs.toString() ? `?${qs.toString()}` : ''}`;
  return apiGetPublic(path);
}

/**
 * カクテル詳細を取得
 * @param id - カクテルのID
 * @returns Promise<Cocktail> カクテルの詳細情報
 */
export async function fetchCocktail(id: string | number): Promise<Cocktail> {
  const cacheKey = `cocktail_detail_${id}`;

  // キャッシュをチェック（TTL付）
  const raw = sessionStorage.getItem(cacheKey);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      // 旧フォーマット互換: 直接データが入っている場合
      if (parsed && !('data' in parsed)) {
        return parsed as Cocktail;
      }
      const { data, ts } = parsed as { data: Cocktail; ts: number };
      if (typeof ts === 'number' && Date.now() - ts < DETAIL_CACHE_TTL_MS) {
        return data;
      }
      // TTL切れは削除して再取得
      sessionStorage.removeItem(cacheKey);
    } catch {
      sessionStorage.removeItem(cacheKey);
    }
  }

  // APIから取得（公開GET）
  const data = await apiGetPublic(`/api/v1/cocktails/${id}`);

  // TTL付きでキャッシュに保存
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // Ignore quota/serialization errors in sessionStorage
  }

  return data as Cocktail;
}

/**
 * カクテル詳細の事前フェッチ（ホバー/フォーカス時の体感を向上）
 * - すでに sessionStorage にある場合は何もしない
 * - 取得後、主要画像があれば事前読み込み（ブラウザキャッシュに載せる）
 */
export async function prefetchCocktail(id: string | number): Promise<void> {
  try {
    const cacheKey = `cocktail_detail_${id}`;
    if (sessionStorage.getItem(cacheKey)) return;
    const data: Cocktail = await fetchCocktail(id);
    const img = (data.image_url_override ?? data.image_url) || undefined;
    if (img) {
      const i = new Image();
      i.src = img;
    }
  } catch {
    // 事前フェッチ失敗はUXに影響しないので無視
  }
}

/**
 * 認証関連の型定義
 */
export interface LoginRequest {
  user: {
    email: string;
    password: string;
  };
}

export interface SignupRequest {
  user: {
    email: string;
    password: string;
    name: string;
  };
}

export interface AuthResponse {
  status: {
    code: number;
    message: string;
  };
  data: {
    user: {
      id: number;
      email: string;
      name: string;
      admin: boolean;
    };
  };
}

/**
 * ログイン
 * @param email - メールアドレス
 * @param password - パスワード
 * @returns Promise<AuthResponse> 認証レスポンス
 */
export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const { data, token } = await apiPostAuth('/api/v1/login', {
    user: { email, password },
  });

  if (token) {
    setAuthToken(token.replace('Bearer ', ''));
  }

  return data;
}

/**
 * 新規登録
 * @param email - メールアドレス
 * @param password - パスワード
 * @param name - ユーザー名
 * @returns Promise<AuthResponse> 認証レスポンス
 */
export async function signup(
  email: string,
  password: string,
  name: string,
): Promise<AuthResponse> {
  const { data, token } = await apiPostAuth('/api/v1/signup', {
    user: { email, password, name },
  });

  if (token) {
    setAuthToken(token.replace('Bearer ', ''));
  }

  return data;
}

/**
 * ログアウト
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/v1/logout`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
  } finally {
    clearAuthToken();
  }
}

/**
 * 現在のユーザー情報を取得
 * @returns Promise<AuthResponse> ユーザー情報
 */
export async function getCurrentUser(): Promise<AuthResponse> {
  return apiGet('/api/v1/users/me');
}

/**
 * PUTリクエストを送信する
 * @param path - APIエンドポイントのパス
 * @param body - リクエストボディ
 * @param init - 追加のfetchオプション
 * @returns レスポンスのJSONデータ
 * @throws {Error} リクエストが失敗した場合
 */
export async function apiPut(path: string, body?: unknown, init?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
    ...init,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(extractErrorMessage('PUT', path, res.status, text));
  }

  return res.json().catch(() => ({}));
}

/**
 * DELETEリクエストを送信する
 * @param path - APIエンドポイントのパス
 * @param init - 追加のfetchオプション
 * @returns レスポンスのJSONデータ
 * @throws {Error} リクエストが失敗した場合
 */
export async function apiDelete(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    ...init,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(extractErrorMessage('DELETE', path, res.status, text));
  }

  return res.json().catch(() => ({}));
}

/**
 * カクテル情報を更新（管理者専用）
 * @param id - カクテルID
 * @param data - 更新するカクテルデータ
 * @returns Promise<Cocktail> 更新後のカクテル情報
 */
export interface UpdateCocktailRequest {
  cocktail: {
    name?: string;
    name_ja?: string;
    glass?: string;
    glass_ja?: string;
    description?: string;
    instructions?: string;
    instructions_ja?: string;
    base?: string;
    strength?: string;
    technique?: string;
    image_url_override?: string;
  };
}

export async function updateCocktail(
  id: number,
  data: UpdateCocktailRequest,
): Promise<Cocktail> {
  const updated = await apiPut(`/api/v1/admin/cocktails/${id}`, data);
  // 詳細ページのセッションキャッシュを無効化
  try {
    sessionStorage.removeItem(`cocktail_detail_${id}`);
    // 一覧ページのセッションキャッシュも無効化（該当キーを総ざらい）
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('cocktails_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // セッションストレージが使用できない環境ではキャッシュ削除を無視
  }
  return updated;
}
