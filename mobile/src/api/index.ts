import apiClient from './apiClient';
import { Booking, ServiceType, Location } from '../types';

export * from './auth.api';

export const bookingApi = {
  create: async (data: {
    vehicleId: string;
    serviceType: ServiceType;
    pickupLocation: Location;
    dropLocation: Location;
    estimatedDistance: number;
    estimatedDuration: number;
    paymentMethod?: string;
  }) => {
    const response = await apiClient.post('/bookings', data);
    return response.data.data as Booking;
  },

  getHistory: async (params?: { status?: string; period?: string; page?: number; limit?: number }) => {
    const response = await apiClient.get('/bookings', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/bookings/${id}`);
    return response.data.data as Booking;
  },

  cancel: async (id: string, reason?: string) => {
    const response = await apiClient.put(`/bookings/${id}/cancel`, { reason });
    return response.data.data as Booking;
  },
};

export const driverApi = {
  getNearby: async (latitude: number, longitude: number, radius?: number) => {
    const response = await apiClient.get('/drivers/nearby', {
      params: { latitude, longitude, radius },
    });
    return response.data.data;
  },

  getDetails: async (id: string) => {
    const response = await apiClient.get(`/drivers/${id}`);
    return response.data.data;
  },

  register: async (data: { licenseNumber: string; experience: number; vehicleClasses?: string[] }) => {
    const response = await apiClient.post('/drivers/register', data);
    return response.data;
  },

  updateAvailability: async (isAvailable: boolean) => {
    const response = await apiClient.put('/drivers/availability', { isAvailable });
    return response.data.data;
  },
};

export const vehicleApi = {
  getAll: async () => {
    const response = await apiClient.get('/vehicles');
    return response.data.data;
  },

  create: async (data: {
    brand: string;
    model: string;
    year?: number;
    registrationNumber: string;
    color: string;
    type?: string;
    isDefault?: boolean;
  }) => {
    const response = await apiClient.post('/vehicles', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<{
    brand: string;
    model: string;
    year: number;
    registrationNumber: string;
    color: string;
    type: string;
    isDefault: boolean;
  }>) => {
    const response = await apiClient.put(`/vehicles/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/vehicles/${id}`);
    return response.data;
  },
};

export const userApi = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data.data;
  },

  updateProfile: async (data: {
    fullName?: string;
    email?: string;
    phone?: string;
    language?: string;
    darkMode?: boolean;
    pushToken?: string;
  }) => {
    const response = await apiClient.put('/users/profile', data);
    return response.data.data;
  },

  getWallet: async () => {
    const response = await apiClient.get('/users/wallet');
    return response.data.data;
  },

  addWalletFunds: async (amount: number) => {
    const response = await apiClient.post('/users/wallet/add', { amount });
    return response.data.data;
  },
};

export const notificationApi = {
  getAll: async (page?: number) => {
    const response = await apiClient.get('/notifications', { params: { page } });
    return response.data.data;
  },

  markRead: async (id: string) => {
    const response = await apiClient.put(`/notifications/${id}/read`);
    return response.data.data;
  },

  markAllRead: async () => {
    const response = await apiClient.put('/notifications/read-all');
    return response.data;
  },
};

export const reviewApi = {
  create: async (data: {
    bookingId: string;
    rating: number;
    categories: {
      drivingSkill: number;
      safety: number;
      professionalism: number;
      punctuality: number;
    };
    comment?: string;
  }) => {
    const response = await apiClient.post('/reviews', data);
    return response.data.data;
  },
};

export const paymentApi = {
  create: async (bookingId: string, method: string) => {
    const response = await apiClient.post('/payments', { bookingId, method });
    return response.data.data;
  },

  verify: async (data: { paymentId: string; orderId: string; status: string }) => {
    const response = await apiClient.post('/payments/verify', data);
    return response.data.data;
  },
};
