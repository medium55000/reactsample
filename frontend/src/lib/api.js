import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // ← 여기만 보면 OK
  // withCredentials 등이 필요하면 추가
});