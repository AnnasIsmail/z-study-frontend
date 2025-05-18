import api from './api';

export const adminLogin = async (email: string, password: string) => {
  try {
    const response = await api.post('/admin/login', { email, password });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Admin login failed');
  }
};

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/admin/dashboard');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
  }
};

export const getUsers = async (params: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  try {
    const response = await api.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

export const getUserDetails = async (userId: string) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user details');
  }
};

export const updateUserStatus = async (userId: string, status: 'active' | 'banned') => {
  try {
    const response = await api.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user status');
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete user');
  }
};

export const updateExchangeRate = async (usdToIdr: number) => {
  try {
    const response = await api.put('/admin/settings/exchange-rate', { usdToIdr });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update exchange rate');
  }
};