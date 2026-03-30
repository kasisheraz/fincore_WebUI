// Authentication Types

export interface OTPRequest {
  phoneNumber: string;
}

export interface OTPResponse {
  message: string;
  phoneNumber: string;
}

export interface OTPVerification {
  phoneNumber: string;
  otp: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  role?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phoneNumber: string, otp: string) => Promise<void>;
  logout: () => void;
  requestOTP: (phoneNumber: string) => Promise<void>;
}
