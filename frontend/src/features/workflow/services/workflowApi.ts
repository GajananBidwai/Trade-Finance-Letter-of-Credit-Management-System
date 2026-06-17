import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
});

// Add interceptor to attach JWT token
api.interceptors.request.use((config) => {
  // Try getting token from localStorage if Redux state is not accessible directly here
  // Actually, we can just rely on the component passing it, or reading from local storage
  return config;
});

export interface LCStatusTransition {
  status: string;
  comment?: string;
  approvedBy: string;
  version: number;
}

export const workflowApi = {
  getAllLCs: async (token: string) => {
    const response = await api.get('/lc', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getLC: async (lcId: string, token: string) => {
    const response = await api.get(`/lc/${lcId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateStatus: async (lcId: string, payload: LCStatusTransition, token: string) => {
    const response = await api.put(`/lc/${lcId}/status`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getDocuments: async (lcId: string, token: string) => {
    const response = await api.get(`/lc/${lcId}/documents`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  uploadDocument: async (lcId: string, payload: any, token: string) => {
    const response = await api.post(`/lc/${lcId}/documents`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  reviewDiscrepancy: async (lcId: string, documentId: string, discrepancyId: string, payload: any, token: string) => {
    const response = await api.put(`/lc/${lcId}/documents/${documentId}/discrepancies/${discrepancyId}/review`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  processSettlement: async (lcId: string, payload: any, token: string) => {
    const response = await api.post(`/${lcId}/settlement`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getDashboardSummary: async (token: string) => {
    const response = await api.get('/dashboard/summary', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getNotifications: async (token: string) => {
    const response = await api.get('/notifications', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  markNotificationAsRead: async (notificationId: string, token: string) => {
    const response = await api.put(`/notifications/${notificationId}/read`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getNotificationPreferences: async (token: string) => {
    const response = await api.get('/notifications/preferences', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  updateNotificationPreferences: async (payload: any, token: string) => {
    const response = await api.put('/notifications/preferences', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  getAuditLogs: async (token: string, params: any = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/reports/audit?${query}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  exportReport: async (payload: any, token: string) => {
    const response = await api.post('/reports/export', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  aiAnalyzeDocument: async (payload: { lcId: string, documentUrl: string, documentType: string }, token: string) => {
    const response = await api.post('/ai/analyze-document', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  aiQueryAssistant: async (payload: { query: string, context?: { lcId: string } }, token: string) => {
    const response = await api.post('/ai/query', payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
