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
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  statusDescription: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED';
  role?: string; // User role from backend (e.g., SYSTEM_ADMINISTRATOR)
  residentialAddressIdentifier?: number;
  postalAddressIdentifier?: number;
  createdDatetime: string;
  lastModifiedDatetime: string;
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
