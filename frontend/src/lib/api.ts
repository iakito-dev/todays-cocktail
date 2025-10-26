/**
 * APIクライアント
 * Rails APIバックエンドとの通信を行うためのユーティリティ関数
 */
import type { Cocktail } from './types';

// API BaseURL設定
// 環境変数VITE_API_BASE_URLから取得、未設定時はローカル開発環境をデフォルトとする
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

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
    headers: { 'Content-Type': 'application/json' },
    ...init, // カスタムヘッダーやその他のオプションをマージ
  });

  // レスポンスステータスが200番台以外の場合はエラー
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${path} failed: ${res.status} ${text}`);
  }

  // JSONパースに失敗した場合は空オブジェクトを返す
  return res.json().catch(() => ({}));
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
}

export async function fetchCocktails(params?: CocktailQuery): Promise<Cocktail[]> {
  const qs = new URLSearchParams();
  if (params) {
    if (params.q) qs.set('q', params.q);
    if (params.ingredients) qs.set('ingredients', params.ingredients);
    if (params.base) {
      const bases = Array.isArray(params.base) ? params.base : params.base.split(',');
      if (bases.length === 1) {
        qs.set('base', bases[0]);
      } else if (bases.length > 1) {
        bases.forEach((b) => qs.append('base[]', b));
      }
    }
  }
  const path = `/api/v1/cocktails${qs.toString() ? `?${qs.toString()}` : ''}`;
  return apiGet(path);
}
