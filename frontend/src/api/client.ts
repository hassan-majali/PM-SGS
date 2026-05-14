import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : "/api/v1";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Module-level token store so the interceptor can read it without importing AuthContext
let _accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function getAccessToken() {
  return _accessToken;
}

// Attach Bearer token to every request
api.interceptors.request.use((config) => {
  if (_accessToken) {
    config.headers.Authorization = `Bearer ${_accessToken}`;
  }
  return config;
});

let _refreshing: Promise<string | null> | null = null;

// On 401, attempt a token refresh once then retry the original request
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retried) {
      original._retried = true;
      try {
        if (!_refreshing) {
          _refreshing = axios
            .post(`${baseURL}/auth/refresh`, {}, { withCredentials: true })
            .then((r) => {
              const token: string = r.data.accessToken;
              setAccessToken(token);
              return token;
            })
            .finally(() => { _refreshing = null; });
        }
        const newToken = await _refreshing;
        if (newToken) {
          original.headers.Authorization = `Bearer ${newToken}`;
          return api(original);
        }
      } catch {
        setAccessToken(null);
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
