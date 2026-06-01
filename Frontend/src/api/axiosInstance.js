import axios from 'axios';
import store from '../store/index.js';
import { logout, setCredentials } from '../store/authSlice.js';
import conf from '../conf/conf.js';

const api = axios.create({
  baseURL: conf.apiBaseUrl ,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const res = await axios.post(
          conf.apiBaseUrl,
          {},
          { withCredentials: true }
        );
        const newToken = res.data.data.acesstoken || res.data.data.accesstoken;
        store.dispatch(setCredentials({ accessToken: newToken }));
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        store.dispatch(logout());
      }
    }
    return Promise.reject(err);
  }
);

export default api;
