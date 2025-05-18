import api from './api';

export const createTopup = async (amount: number) => {
  try {
    const response = await api.post('/topup/create', { amount });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create topup request');
  }
};

export const checkTopupStatus = async (topupId: string) => {
  try {
    const response = await api.get(`/topup/status/${topupId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to check topup status');
  }
};