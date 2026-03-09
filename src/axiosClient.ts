import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true,
});

// Lazy import để tránh circular dependency
let _store: any = null;
const getStore = () => {
  if (!_store) {
    _store = require("./reduxStore").default;
  }
  return _store;
};

// Gắn token JWT vào header Authorization cho mọi request
axiosInstance.interceptors.request.use(
  (config) => {
    try {
      const store = getStore();
      const token = store?.getState()?.user?.token;
      if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
      }
    } catch (e) {
      // Store chưa sẵn sàng, bỏ qua
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Xử lý response: trả về data trực tiếp & auto logout khi 401
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Nếu backend trả về 401 (token hết hạn hoặc không hợp lệ) → tự động logout
    if (error.response && error.response.status === 401) {
      try {
        const store = getStore();
        const { processLogout } = require("./store/actions");
        store.dispatch(processLogout());
      } catch (e) {
        // Store chưa sẵn sàng, bỏ qua
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
