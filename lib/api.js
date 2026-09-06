const API_BASE = '/api';
const TOKEN_KEY = 'nav_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });

  if (response.status === 401) {
    clearToken();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

export async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Login failed');
  }

  const data = await response.json();
  setToken(data.token);
  return data;
}

export async function logout() {
  try {
    await request('/auth/logout', { method: 'POST' });
  } finally {
    clearToken();
  }
}

export async function fetchMe() {
  return request('/auth/me');
}

export async function fetchHospitals() {
  return request('/hospitals');
}

export async function fetchUsers() {
  return request('/users');
}

export async function updateUser(userId, data) {
  return request(`/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

export async function fetchRoles() {
  return request('/roles');
}

export async function fetchNavigationItems() {
  return request('/roles/navigation-items/all');
}

export async function updateRoleNavigation(roleId, allowedNavKeys) {
  return request(`/roles/${roleId}/navigation`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ allowedNavKeys }),
  });
}

export async function updateRoleScreenPrivileges(roleId, screenPrivileges) {
  return request(`/roles/${roleId}/screen-privileges`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ screenPrivileges }),
  });
}

export async function performAction(action, screenKey) {
  if (action === 'delete') {
    return request(`/actions/delete?screenKey=${encodeURIComponent(screenKey)}`, { method: 'DELETE' });
  }
  return request(`/actions/${action}`, {
    method: action === 'create' ? 'POST' : 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ screenKey }),
  });
}

export async function fetchNavigation(hospitalId) {
  const params = new URLSearchParams();
  if (hospitalId) params.append('hospitalId', hospitalId);
  const query = params.toString() ? `?${params}` : '';
  return request(`/navigation${query}`);
}
