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
  token: string;
  user: User;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
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
