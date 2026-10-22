import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8090",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("sky_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // token inválido/expirado: limpa sessão
      localStorage.removeItem("sky_token");
      localStorage.removeItem("sky_user");
    }
    return Promise.reject(err);
  }
);

export default api;
