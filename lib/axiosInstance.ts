import axios from "axios";

const api = axios.create({
  baseURL: "/",
});

api.interceptors.response.use(
  (response) => response, // success — pass through

  async (error) => {
    const originalRequest = error.config;

    // try to refresh token first before logging out
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // attempt to refresh
        await axios.post("/api/auth/refresh");
        // retry original request with new access token
        return api(originalRequest);
      } catch {
        // refresh also failed — session fully expired, force logout
        await axios.post("/api/auth/logout");
        window.dispatchEvent(new Event("session-expired"));
        window.location.href = "/login"; // hard redirect — clears everything
      }
    }

    return Promise.reject(error);
  },
);

export default api;
