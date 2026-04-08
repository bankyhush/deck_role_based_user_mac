import axios from "axios";

const api = axios.create({
  baseURL: "/",
});

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post("/api/auth/refresh");
        return api(originalRequest);
      } catch {
        await axios.post("/api/auth/logout");
        window.dispatchEvent(new Event("session-expired"));
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default api;
