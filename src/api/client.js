// Thin fetch wrapper around the Meepled API. Attaches the JWT bearer token
// (saved by AuthContext) and base URL from VITE_API_BASE_URL.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5029';
const TOKEN_KEY = 'meepled.token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text();
    const error = new Error(text || `${res.status} ${res.statusText}`);
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) return null;
  const contentType = res.headers.get('content-type') || '';
  return contentType.includes('application/json') ? res.json() : res.text();
}

export const api = {
  get: (path, opts) => request(path, { ...opts, method: 'GET' }),
  post: (path, body, opts) => request(path, { ...opts, method: 'POST', body }),
  patch: (path, body, opts) => request(path, { ...opts, method: 'PATCH', body }),
  del: (path, opts) => request(path, { ...opts, method: 'DELETE' }),
};

// --- Endpoint helpers (extend as controllers are added) ---
export const auth = {
  register: (data) => api.post('/api/auth/register', data, { auth: false }),
  login: (data) => api.post('/api/auth/login', data, { auth: false }),
};

export const cafes = {
  list: (q) => api.get(`/api/cafes${q ? `?q=${encodeURIComponent(q)}` : ''}`, { auth: false }),
  get: (id) => api.get(`/api/cafes/${id}`, { auth: false }),
  my: () => api.get('/api/cafes/my'),
};

export const games = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return api.get(`/api/games${qs ? `?${qs}` : ''}`, { auth: false });
  },
  get: (id) => api.get(`/api/games/${id}`, { auth: false }),
  bggSearch: (q) => api.get(`/api/bgg/search?q=${encodeURIComponent(q)}`),
  import: (bggId) => api.post('/api/games/import', { bggId }),
};

export const wishlist = {
  list: () => api.get('/api/wishlist'),
  add: (gameId) => api.post(`/api/wishlist/${gameId}`, undefined),
  remove: (gameId) => api.del(`/api/wishlist/${gameId}`),
};

export const comments = {
  list: (target, id) => api.get(`/api/comments?target=${target}&id=${id}`, { auth: false }),
  post: (data) => api.post('/api/comments', data),
};

export const reviews = {
  post: (data) => api.post('/api/reviews', data),
};

export const cafeGames = {
  add: (data) => api.post('/api/cafe-games', data),
  update: (id, data) => api.patch(`/api/cafe-games/${id}`, data),
  remove: (id) => api.del(`/api/cafe-games/${id}`),
};

// BGG proxy — browser calls our API; our server calls BGG (avoids CORS/401).
export const bgg = {
  image: (bggId) => api.get(`/api/bgg/image/${bggId}`, { auth: false }),
};
