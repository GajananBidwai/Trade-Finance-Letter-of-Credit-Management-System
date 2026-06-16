export interface User {
  id: string;
  role: 'TRADE_OFFICER' | 'COMPLIANCE_ANALYST' | 'SETTLEMENT_OFFICER' | 'ADMIN' | 'READ_ONLY';
  email?: string;
}

export interface AuthResponse {
  status: 'success' | 'error';
  data?: {
    token: string;
    refreshToken: string;
    user: User;
  };
  message?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}
