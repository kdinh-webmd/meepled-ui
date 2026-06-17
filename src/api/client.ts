import type {
  AuthResponse, BggImageResult, BggSearchResult, CafeCard, CafeDetail,
  Comment, GameCardData, GameDetailData, HotGame, UpdateCafeRequest,
  UpdateUserRequest, WishlistItem,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5029';
const TOKEN_KEY = 'meepled.token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

async function request<T = unknown>(
  path: string,
  { method = 'GET', body, auth = true }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    const error = Object.assign(new Error(text || `${res.status} ${res.statusText}`), { status: res.status });
    throw error;
  }
  if (res.status === 204) return null as T;
  const ct = res.headers.get('content-type') ?? '';
  return ct.includes('application/json') ? res.json() : (res.text() as unknown as T);
}

const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'PATCH', body }),
  del: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'DELETE' }),
};

export const auth = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/register', data, { auth: false }),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/login', data, { auth: false }),
};

export const cafes = {
  list: (q?: string) =>
    api.get<CafeCard[]>(`/api/cafes${q ? `?q=${encodeURIComponent(q)}` : ''}`, { auth: false }),
  get: (id: string) => api.get<CafeDetail>(`/api/cafes/${id}`, { auth: false }),
  my: () => api.get<CafeDetail>('/api/cafes/my'),
  update: (data: UpdateCafeRequest) =>
    api.patch<{ id: string; name: string }>('/api/cafes/my', data),
};

export const games = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get<GameCardData[]>(`/api/games${qs ? `?${qs}` : ''}`, { auth: false });
  },
  get: (id: string) => api.get<GameDetailData>(`/api/games/${id}`, { auth: false }),
  hot: () => api.get<HotGame[]>('/api/games/hot', { auth: false }),
  bggSearch: (q: string) =>
    api.get<BggSearchResult[]>(`/api/bgg/search?q=${encodeURIComponent(q)}`),
  import: (bggId: number) => api.post<GameCardData>('/api/games/import', { bggId }),
};

export const users = {
  updateMe: (data: UpdateUserRequest) => api.patch<AuthResponse>('/api/users/me', data),
};

export const wishlist = {
  list: () => api.get<WishlistItem[]>('/api/wishlist'),
  add: (gameId: string) => api.post<void>(`/api/wishlist/${gameId}`),
  remove: (gameId: string) => api.del<void>(`/api/wishlist/${gameId}`),
};

export const comments = {
  list: (target: string, id: string) =>
    api.get<Comment[]>(`/api/comments?target=${target}&id=${id}`, { auth: false }),
  post: (data: { target: string; targetId: string; body: string }) =>
    api.post<Comment>('/api/comments', data),
};

export const reviews = {
  post: (data: { cafeId: string; stars: number; body?: string | null }) =>
    api.post<void>('/api/reviews', data),
};

export const cafeGames = {
  add: (data: { cafeId: string; gameId: string; copies?: number }) =>
    api.post('/api/cafe-games', data),
  update: (id: string, data: { featured?: boolean; copies?: number }) =>
    api.patch(`/api/cafe-games/${id}`, data),
  remove: (id: string) => api.del(`/api/cafe-games/${id}`),
};

export const bgg = {
  image: (bggId: number) =>
    api.get<BggImageResult>(`/api/bgg/image/${bggId}`, { auth: false }),
};
