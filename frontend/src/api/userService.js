import apiClient from './apiClient';

export const userService = {
  getProfile: () => apiClient.get('/users/profile'),
  updateProfile: (data) => apiClient.patch('/users/profile', data),
  updatePassword: (data) => apiClient.put('/users/password', data),
  getUsage: () => apiClient.get('/users/usage'),
  exportData: () => apiClient.get('/users/export-data'),
  deleteAccount: () => apiClient.delete('/users/me'),
};
