import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-bea9ce3f`;

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
}

async function apiCall(endpoint: string, options: ApiOptions = {}) {
  const { method = 'GET', body, token } = options;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token || publicAnonKey}`,
  };

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API call failed for ${endpoint}:`, error);
    throw error;
  }
}

// User APIs
export const signup = async (email: string, password: string, name: string) => {
  return apiCall('/auth/signup', {
    method: 'POST',
    body: { email, password, name },
  });
};

export const login = async (email: string, password: string) => {
  return apiCall('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
};

// Favorites APIs
export const getFavorites = async (token: string) => {
  return apiCall('/favorites', { token });
};

export const addFavorite = async (cocktailId: string, token: string) => {
  return apiCall('/favorites', {
    method: 'POST',
    body: { cocktailId },
    token,
  });
};

export const removeFavorite = async (cocktailId: string, token: string) => {
  return apiCall(`/favorites/${cocktailId}`, {
    method: 'DELETE',
    token,
  });
};

export const toggleFavorite = async (cocktailId: string, token: string) => {
  return apiCall('/favorites/toggle', {
    method: 'POST',
    body: { cocktailId },
    token,
  });
};
