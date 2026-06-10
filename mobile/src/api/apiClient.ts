import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../constants';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token and apply IP override
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const ipOverride = await AsyncStorage.getItem('@api_ip_override');
      if (ipOverride && ipOverride.trim()) {
        config.baseURL = `http://${ipOverride.trim()}:5050/api`;
        console.log('[DEBUG] Request Base URL (AsyncStorage Override):', config.baseURL);
      } else {
        console.log('[DEBUG] Request Base URL (Default):', config.baseURL);
      }
    } catch (e) {
      console.log('Failed to load IP override:', e);
    }

    const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401, refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });

        await AsyncStorage.multiSet([
          [STORAGE_KEYS.ACCESS_TOKEN, data.data.accessToken],
          [STORAGE_KEYS.REFRESH_TOKEN, data.data.refreshToken],
        ]);

        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        await AsyncStorage.multiRemove([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.REFRESH_TOKEN,
          STORAGE_KEYS.USER,
        ]);
        // Navigation to login would be handled by Redux state change
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
