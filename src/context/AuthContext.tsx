import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User } from '../types/auth.types';
import authService from '../services/authService';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  //Initialize synchronously from localStorage to avoid race conditions
  const [user, setUser] = useState<User | null>(() => authService.getStoredUser());
  const [token, setToken] = useState<string | null>(() => authService.getToken());
  const [isLoading, setIsLoading] = useState(false); // Start as false since we loaded synchronously

  useEffect(() => {
    // Only validate token if we have one AND we're not in mock mode
    // In mock mode, we trust the localStorage values without API validation
    const isMockMode = localStorage.getItem('authToken')?.startsWith('mock-jwt-token');
    
    if (token && user && !isMockMode) {
      const validateAuth = async () => {
        try {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (error) {
          // Token is invalid, clear auth
          // Only clear if it's a real auth error, not a network issue
          if (error && typeof error === 'object' && 'response' in error) {
            const axiosError = error as { response?: { status?: number } };
            if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
              authService.logout();
              setToken(null);
              setUser(null);
            }
          }
        }
      };
      validateAuth();
    }
  }, []); // Only run once on mount

  const requestOTP = async (phoneNumber: string): Promise<void> => {
    await authService.requestOTP(phoneNumber);
  };

  const login = async (phoneNumber: string, otp: string): Promise<void> => {
    const authResponse = await authService.verifyOTP(phoneNumber, otp);
    setToken(authResponse.token);
    setUser(authResponse.user);
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    requestOTP,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
