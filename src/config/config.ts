// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
  TIMEOUT: 30000,
};

// Application Configuration
export const APP_CONFIG = {
  NAME: 'FinCore',
  VERSION: '1.0.0',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  // Enable mock authentication for development (bypasses OTP)
  // In production, this will be false, using real backend authentication
  MOCK_AUTH: process.env.REACT_APP_MOCK_AUTH === 'true',
};

// Theme Configuration
export const THEME_CONFIG = {
  DRAWER_WIDTH: 240,
  HEADER_HEIGHT: 64,
};

const config = {
  API_CONFIG,
  APP_CONFIG,
  THEME_CONFIG,
};

export default config;