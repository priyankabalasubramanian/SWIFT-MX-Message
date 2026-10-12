/**
 * API client service for communicating with the Spring Boot backend.
 * Handles JWT token storage, request authorization headers, and error parsing.
 */

/**
 * Resolves the backend API base URL from Vite environment variable VITE_API_BASE_URL.
 * Falls back to 'http://localhost:8080' for local development.
 * Normalizes trailing slashes and ensures the '/api' context path is present.
 */
function resolveApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  const rawUrl = (typeof envUrl === 'string' && envUrl.trim()) ? envUrl.trim() : 'http://localhost:8080';
  const cleanUrl = rawUrl.replace(/\/+$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
}

export const API_BASE_URL = resolveApiBaseUrl();
const TOKEN_KEY = 'swift_mx_jwt_token';
const USER_KEY = 'swift_mx_user';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  removeToken: () => localStorage.removeItem(TOKEN_KEY),
  getUser: () => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setUser: (user) => localStorage.setItem(USER_KEY, JSON.stringify(user)),
  removeUser: () => localStorage.removeItem(USER_KEY),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = authStorage.getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401) {
      authStorage.clear();
      throw new Error('Your session has expired or is invalid. Please sign in again.');
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || data?.data?.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error(`Unable to connect to the backend server at ${API_BASE_URL}. Please verify the service is running and CORS allows this origin.`);
    }
    throw err;
  }
}

export const api = {
  // Authentication
  login: async (email, password) => {
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: normalizedEmail, username: normalizedEmail, password })
    });
    if (res && res.token) {
      authStorage.setToken(res.token);
      authStorage.setUser({
        email: res.email || res.username || normalizedEmail,
        username: res.username || res.email || normalizedEmail,
        fullName: res.fullName,
        role: res.role
      });
    }
    return res;
  },

  register: async (fullName, email, password) => {
    const normalizedEmail = email ? email.trim().toLowerCase() : '';
    const trimmedName = fullName ? fullName.trim() : '';
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName: trimmedName, email: normalizedEmail, password })
    });
    if (res && res.token) {
      authStorage.setToken(res.token);
      authStorage.setUser({
        email: res.email || normalizedEmail,
        username: res.username || res.email || normalizedEmail,
        fullName: res.fullName || trimmedName,
        role: res.role
      });
    }
    return res;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors on logout
    } finally {
      authStorage.clear();
    }
  },

  // Messages
  getMessages: async () => {
    const res = await apiRequest('/messages');
    return res?.data || [];
  },

  getMessageById: async (id) => {
    const res = await apiRequest(`/messages/${encodeURIComponent(id)}`);
    return res?.data || null;
  },

  searchMessages: async (query) => {
    const endpoint = query ? `/messages/search?q=${encodeURIComponent(query)}` : '/messages';
    const res = await apiRequest(endpoint);
    return res?.data || [];
  },

  createMessage: async (messageData) => {
    const res = await apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify(messageData)
    });
    return res?.data;
  }
};
