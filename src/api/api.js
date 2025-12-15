import axios from "axios";
import { getEndpoint } from "../config/runtimeConfig.js";
//const API_BASE_URL = window.__APP_CONFIG__.BASE_URL;

// const api = axios.create({
//   baseURL: API_BASE_URL,
// });

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    const isAuth = config.url?.includes(getEndpoint("LOGIN"));
    if (!isAuth && token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("401 Unauthorized");
      window.location.href = "/login";
    } else if (
      error.response &&
      (error.response.status === 500 || error.response.status === 403)
    ) {
      window.alert(error.response.data?.message);
    }
    return Promise.reject(error);
  }
);
export default axios;
