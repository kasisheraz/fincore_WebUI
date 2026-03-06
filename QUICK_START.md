# FinCore WebUI - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- npm or yarn package manager
- User Management API running (default: http://localhost:8080)

### Installation
```bash
# Navigate to project directory
cd c:\Development\git\fincore_WebUI

# Install dependencies (if not already done)
npm install

# Start development server
npm start
```

The application will open at `http://localhost:3000`

---

## 🔐 Authentication System

### How It Works

1. **OTP-Based Login**
   - User enters phone number (10 digits)
   - System sends OTP to phone via SMS
   - User enters 6-digit OTP
   - System verifies and issues JWT token

2. **Token Management**
   - JWT token stored in localStorage
   - Automatically attached to all API requests
   - Token expires based on API configuration
   - Auto-logout on token expiration

### Testing Authentication

#### Method 1: Using Real API
```typescript
// Ensure API is running at http://localhost:8080
// Update src/config/config.ts if needed:
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  TIMEOUT: 30000,
};
```

#### Method 2: Mock Data (Development)
For testing without API, you can temporarily modify `authService.ts`:

```typescript
// In src/services/authService.ts

async requestOTP(phoneNumber: string): Promise<OTPResponse> {
  // Mock response for testing
  return {
    message: 'OTP sent successfully',
    phoneNumber: phoneNumber
  };
}

async verifyOTP(phoneNumber: string, otp: string): Promise<AuthResponse> {
  // Mock response for testing (OTP: 123456)
  if (otp === '123456') {
    const mockResponse = {
      token: 'mock-jwt-token-for-testing',
      user: {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phoneNumber: phoneNumber,
        dateOfBirth: '1990-01-01',
        gender: 'MALE' as const,
        status: 'ACTIVE' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    };
    
    localStorage.setItem('authToken', mockResponse.token);
    localStorage.setItem('user', JSON.stringify(mockResponse.user));
    
    return mockResponse;
  }
  throw new Error('Invalid OTP');
}
```

### Login Flow

1. Navigate to `http://localhost:3000/login`
2. Enter phone number (e.g., `1234567890`)
3. Click "Request OTP"
4. Enter the OTP received (or `123456` for mock)
5. Click "Verify OTP"
6. Redirected to Dashboard on success

### Protected Routes

All routes except `/login` are protected and require authentication:

- `/dashboard` - Dashboard page
- `/users` - User management (coming soon)
- `/organizations` - Organization management (coming soon)
- `/kyc/documents` - KYC documents (coming soon)
- `/kyc/verification` - KYC verification (coming soon)
- `/questionnaire` - Questionnaires (coming soon)
- `/profile` - User profile
- `/settings` - Application settings
- `/reports` - Reports

### Logout

Click on the user avatar in the top-right corner and select "Logout"

---

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx         # OTP login form
│   │   └── ProtectedRoute.tsx    # Route protection HOC
│   ├── common/
│   │   ├── LoadingSpinner.tsx    # Loading indicator
│   │   ├── StatusChip.tsx        # Status display chip
│   │   └── ConfirmDialog.tsx     # Confirmation dialog
│   └── layout/
│       ├── Header.tsx             # App header with user menu
│       └── Sidebar.tsx            # Navigation sidebar
├── context/
│   ├── AuthContext.tsx            # Authentication state management
│   └── ThemeContext.tsx           # Theme management
├── pages/
│   ├── auth/
│   │   └── Login.tsx              # Login page
│   └── Dashboard.tsx              # Main dashboard
├── services/
│   ├── apiService.ts              # Axios HTTP client
│   └── authService.ts             # Authentication API calls
├── types/
│   ├── auth.types.ts              # Authentication TypeScript types
│   └── common.types.ts            # Common TypeScript types
├── utils/
│   ├── formatters.ts              # Data formatting functions
│   ├── validators.ts              # Input validation functions
│   └── constants.ts               # Application constants
├── theme/
│   └── finCoreTheme.ts            # Material-UI theme
└── App.tsx                        # Main app component
```

---

## 🎨 Theming

### FinCore Theme
- **Primary Color**: Dark Green (#003D2A)
- **Secondary Color**: Burgundy (#8B0000)
- **Typography**: Inter, Roboto
- **Components**: Material-UI v5

### Color Palette
```typescript
Primary: {
  main: '#003D2A',    // FinCore Dark Green
  light: '#00503C',   // Lighter shade
  dark: '#002419',    // Darker shade
}

Secondary: {
  main: '#8B0000',    // Burgundy
  light: '#A52A2A',   // Brown
  dark: '#660000',    // Dark Red
}
```

---

## 🔧 Configuration

### API Configuration
Edit `src/config/config.ts`:

```typescript
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api',
  TIMEOUT: 30000,
};
```

### Environment Variables
Create `.env` file in root:

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
REACT_APP_ENVIRONMENT=development
```

---

## 🛠️ Development Tips

### Hot Reload
The app uses React hot reload. Changes to files will automatically refresh the browser.

### TypeScript
The project uses TypeScript for type safety. Always define proper types for:
- Component props
- API responses
- Service functions
- Context state

### ESLint
Run ESLint to check for code quality issues:
```bash
npm run lint
```

### Build for Production
```bash
npm run build
```

---

## 📝 What's Implemented

✅ **Authentication System**
- OTP-based login flow
- JWT token management
- Protected routes
- Auto-logout on token expiration
- User context and state management

✅ **Core Components**
- Login page with OTP verification
- Loading spinners
- Status chips
- Confirmation dialogs
- User menu with logout

✅ **Utilities**
- Phone number formatting
- Date/time formatting
- Input validation
- Status formatting
- Type definitions

---

## 🎯 Next Steps

The following modules are planned for implementation:

1. **User Management** - CRUD operations for users
2. **Organization Management** - Multi-step organization forms
3. **KYC Documents** - Document upload and management
4. **KYC Verification** - Verification workflow
5. **Questionnaire** - Question management
6. **Customer Answers** - Answer tracking

---

## 🐛 Troubleshooting

### Issue: "Failed to send OTP"
**Solution**: Ensure User Management API is running at `http://localhost:8080`

### Issue: "Invalid OTP"
**Solution**: 
- Check if OTP was sent to your phone
- Try using mock OTP `123456` if testing with mocked service
- Verify API is processing OTP correctly

### Issue: "Unauthorized (401)"
**Solution**:
- Token may have expired, logout and login again
- Clear localStorage: `localStorage.clear()`
- Check API authentication configuration

### Issue: "Network Error"
**Solution**:
- Check API is running
- Verify `BASE_URL` in config.ts
- Check CORS configuration on API

---

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Material-UI Documentation](https://mui.com)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [User Management API Repository](https://github.com/kasisheraz/userManagementApi)

---

**Version**: 1.0  
**Last Updated**: March 3, 2026  
**Status**: Authentication Module Complete ✅
