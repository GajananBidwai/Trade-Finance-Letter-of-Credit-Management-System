import { UserRole } from '../model/User.model';

export interface LoginRequestDto {
  email: string;
  password?: string; // Optional because we might handle OAuth later, but required in validation for now
}

export interface RefreshRequestDto {
  refreshToken: string;
}

export interface LogoutRequestDto {
  token: string;
}

export interface AuthResponseDto {
  token: string;
  refreshToken?: string;
  user?: {
    id: string;
    role: UserRole;
    email?: string;
  };
}
