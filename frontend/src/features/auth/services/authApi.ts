// import axios from 'axios';
import type { LoginPayload, AuthResponse } from '../types';

// Simulated api instance setup
// const api = axios.create({ ... });

export const authApi = {
  login: async (credentials: LoginPayload): Promise<AuthResponse> => {
    // In a real application, this would be:
    // const response = await api.post<AuthResponse>('/auth/login', credentials);
    // return response.data;
    
    // Simulating API call for demonstration purposes
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email === 'officer@lumina.trade' && credentials.password === 'password123') {
          resolve({
            status: 'success',
            data: {
              token: 'mock-jwt-token-xyz',
              refreshToken: 'mock-refresh-token-abc',
              user: {
                id: '12345',
                role: 'TRADE_OFFICER',
                email: credentials.email,
              }
            }
          });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  },
  
  logout: async (_token: string) => {
    // return await api.post('/auth/logout', { token: _token });
    return new Promise(resolve => setTimeout(resolve, 500));
  }
};
