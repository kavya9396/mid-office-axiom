// src/types/auth.ts

export interface LoginRequest {
  username: string;
  password: string;
  source: string;
}

export interface LoginResponse {
  status: string;
  token: string;
  expiresIn: number;
  username: string;
  roles: string[];
}