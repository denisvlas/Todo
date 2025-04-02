export const API_BASE = "http://localhost:3001";

export const AUTH_ENDPOINTS = {
  REGISTER_PASSWORD: `${API_BASE}/auth/register-password`,
  LOGIN_PASSWORD: `${API_BASE}/auth/login-password`,
  REGISTER_OPTIONS: `${API_BASE}/auth/register-options`,
  REGISTER_VERIFY: `${API_BASE}/auth/register-verify`,
  GENERATE_OPTIONS: `${API_BASE}/auth/generate-options`,
  AUTH_VERIFY: `${API_BASE}/auth/auth-verify`,
  AUTH_METHODS: `${API_BASE}/auth/methods`,
};