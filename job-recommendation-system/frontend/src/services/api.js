/**
 * api.js — one place for talking to the backend.
 *
 * Every component can import { api } and call api.login(...), api.getProfile(),
 * etc., instead of repeating fetch boilerplate and token handling everywhere.
 * The dev proxy in package.json forwards these to http://localhost:5000.
 */

const token = () => localStorage.getItem('token');

async function request(path, { method = 'GET', body, isForm = false } = {}) {
  const headers = {};
  if (token()) headers['Authorization'] = `Bearer ${token()}`;
  if (!isForm && body) headers['Content-Type'] = 'application/json';

  const res = await fetch(path, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = text; }

  if (!res.ok) {
    const message = (data && data.message) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  // Auth
  signup: (email, password) => request('/signup', { method: 'POST', body: { email, password } }),
  login: (email, password) => request('/login', { method: 'POST', body: { email, password } }),

  // Profile / preferences
  getUserData: () => request('/user-data'),
  getProfile: () => request('/profile'),
  updateProfile: (fields) => request('/profile', { method: 'PUT', body: fields }),
  getPreferences: () => request('/user-preferences'),
  updatePreferences: (prefs) => request('/user-preferences', { method: 'PUT', body: prefs }),
  updatePassword: (currentPassword, newPassword) =>
    request('/update-password', { method: 'PUT', body: { currentPassword, newPassword } }),

  // Jobs
  getRecommendations: () => request('/recommendations'),

  // Uploads (FormData)
  uploadProfilePicture: (formData) => request('/profile-picture', { method: 'PUT', body: formData, isForm: true }),
  uploadResume: (formData) => request('/resume', { method: 'PUT', body: formData, isForm: true }),

  // Billing
  saveBilling: (details) => request('/billing', { method: 'POST', body: details }),
};

export default api;
