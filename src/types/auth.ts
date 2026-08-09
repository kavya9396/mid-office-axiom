// src/types/auth.ts

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  expiresIn: number;
  refreshToken: string;
  refreshExpiresIn: number;
  username: string;
  password:string;
  roles: string[];
  firstLogin: boolean;
  firstLoginAt: string | null;
  lastLoginAt: string | null;
}

export interface LoginResponse {
  response_code: number;
  error: boolean;
  message: string;
  data: LoginResponseData | null;
}