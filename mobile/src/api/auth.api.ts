import apiClient from './apiClient';

export const authApi = {
  register: async (data: { fullName: string; phone: string; email: string; password: string }) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await apiClient.post('/auth/login', data);
    return response.data.data;
  },

  loginWithPhone: async (phone: string) => {
    const response = await apiClient.post('/auth/login/phone', { phone });
    return response.data.data;
  },

  verifyPhoneLogin: async (data: { userId: string; otp: string }) => {
    const response = await apiClient.post('/auth/login/phone/verify', data);
    return response.data.data;
  },

  verifyOTP: async (data: { userId: string; otp: string }) => {
    const response = await apiClient.post('/auth/verify-otp', data);
    return response.data.data;
  },

  resendOTP: async (userId: string) => {
    const response = await apiClient.post('/auth/resend-otp', { userId });
    return response.data;
  },

  forgotPassword: async (phone: string) => {
    const response = await apiClient.post('/auth/forgot-password', { phone });
    return response.data.data;
  },

  resetPassword: async (data: { userId: string; otp: string; password: string }) => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data.data;
  },
};
