import axios from 'axios';

const API_URL = 'http://localhost:4000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const userApi = {
  getUsers: async (token: string, params?: { page?: number; limit?: number; role?: string; status?: string }) => {
    const response = await api.get('/users', {
      headers: { Authorization: `Bearer ${token}` },
      params
    });
    return response.data;
  },

  createUser: async (payload: { name: string; email: string; role: string; permissions?: string[] }, token: string) => {
    const response = await api.post('/users', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateUser: async (id: string, payload: { role?: string; status?: string; permissions?: string[] }, token: string) => {
    const response = await api.put(`/users/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  approveMutation: async (id: string, token: string) => {
    const response = await api.post(`/users/approvals/${id}/approve`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
