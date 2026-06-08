import axios from "axios";
import endpoints from "../constants/Endpoints";
import { getBackendErrorMessage } from "../utils/errorUtils";

const api = axios.create();

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    const isAuth = config.url?.includes(endpoints.LOGIN);
    if (!isAuth && token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url ?? "";
    const isLogin = url.includes("/login");
    if (!isLogin && error.response && error.response.status === 401) {
      console.warn("401 Unauthorized");
      window.location.href = "/login";
    } else if (
      !error.config?.skipGlobalErrorAlert &&
      error.response &&
      error.response.status !== 422 &&
      error.response.status !== 401 &&
      error.response.status !== 409
    ) {
      window.alert(getBackendErrorMessage(error));
    }
    return Promise.reject(error);
  },
);

export default api;
