import axios from 'axios';
import { API_BASE_URL } from './config';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// import axios from "axios";

// export const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL, // ← 여기만 보면 OK
//   // withCredentials 등이 필요하면 추가
// });


// import { API_BASE_URL } from './config';

// export async function getTodos() {
//   const res = await fetch(`${API_BASE_URL}/api/todos`);
//   return res.json();
// }