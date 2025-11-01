import axios from 'axios';
import { API_BASE_URL } from './config';

// ✅ Axios Instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Global Error Interceptor.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API Error:", err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

// ================== CRUD ==================

// ✅ List Todos
export async function listTodos({ page = 1, limit = 20, q = '' } = {}) {
  return api.get(`/api/todos`, { params: { page, limit, q } }).then(r => r.data);
}

// ✅ Get Single Todo
export async function getTodo(id) {
  return api.get(`/api/todos/${id}`).then(r => r.data);
}

// ✅ Create Todo
export async function createTodo({ title, done = false }) {
  return api.post(`/api/todos`, { title, done }).then(r => r.data);
}

// ✅ Patch Todo
export async function patchTodo(id, payload) {
  return api.patch(`/api/todos/${id}`, payload).then(r => r.data);
}

// ✅ Delete Todo
export async function deleteTodo(id) {
  return api.delete(`/api/todos/${id}`).then(r => r.data);
}


// import { API_BASE_URL } from './config';

// async function request(path, options = {}) {
//   try {
//     const res = await fetch(`${API_BASE_URL}${path}`, {
//       headers: { 'Content-Type': 'application/json' },
//       ...options,
//     });

//     if (res.status === 204) return;
//     const data = await res.json().catch(() => null);
//     if (!res.ok) throw new Error(data?.message || 'Request failed');
//     return data;
//   } catch (err) {
//     console.error('[API Error]', err.message);
//     throw err;
//   }
// }

// export function listTodos({ page = 1, limit = 20, q = '' } = {}) {
//   const params = new URLSearchParams({ page, limit, ...(q ? { q } : {}) });
//   return request(`/api/todos?${params.toString()}`);
// }

// export function getTodo(id) {
//   return request(`/api/todos/${id}`);
// }

// export function createTodo({ title, done = false }) {
//   return request(`/api/todos`, {
//     method: 'POST',
//     body: JSON.stringify({ title, done }),
//   });
// }

// export function patchTodo(id, payload) {
//   return request(`/api/todos/${id}`, {
//     method: 'PATCH',
//     body: JSON.stringify(payload),
//   });
// }

// export function deleteTodo(id) {
//   return request(`/api/todos/${id}`, { method: 'DELETE' });
// }