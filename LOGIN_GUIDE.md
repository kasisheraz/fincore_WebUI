# 🔐 Login Guide - FinCore WebUI

## Development Mode (Mock Authentication) - **CURRENTLY ENABLED**

The application is now configured with **mock authentication** for easy UI testing without needing the full API.

---

## 📱 Test Credentials

Use any of these phone numbers to log in:

### User 1: John Doe (ID: 1)
- **Phone**: `1234567890`
- **OTP**: `123456`
- Email: john.doe@fincore.com
- Gender: Male
- Status: Active

### User 2: Jane Smith (ID: 2)
- **Phone**: `9876543210`
- **OTP**: `123456`
- Email: jane.smith@fincore.com
- Gender: Female
- Status: Active

### User 3: Admin User (ID: 3)
- **Phone**: `5555555555`
- **OTP**: `123456`
- Email: admin@fincore.com
- Gender: Other
- Status: Active

---

## 🚀 How to Login

### Step 1: Open the Application
Navigate to: `http://localhost:3000/login`

### Step 2: Enter Phone Number
Type one of the test phone numbers above (e.g., `1234567890`)

### Step 3: Request OTP
Click the **"Request OTP"** button

### Step 4: Enter OTP
Type `123456` in the OTP field

### Step 5: Verify & Login
Click **"Verify & Login"**

### Step 6: Success! 🎉
You'll be redirected to the dashboard and can now access:
- Dashboard (`/dashboard`)
- Users (`/users`)
- Profile (`/profile`)
- Settings (`/settings`)
- Reports (`/reports`)
- Applications (`/applications`)

---

## 🔄 Switching Between Mock and Real API

### Currently: Mock Mode (Enabled)

**File**: `src/config/config.ts`

```typescript
export const APP_CONFIG = {
  NAME: 'FinCore',
  VERSION: '1.0.0',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  MOCK_AUTH: true, // ← Currently TRUE (mock mode)
};
```

### To Use Real API:

1. **Start your User Management API** at `http://localhost:8080`

2. **Update config file** (`src/config/config.ts`):
   ```typescript
   MOCK_AUTH: false, // ← Change to FALSE
   ```

3. **Restart the development server**:
   ```bash
   npm start
   ```

4. **Use real credentials**:
   - Enter a real phone number from your database
   - Use the actual OTP sent by your API
   - Login with verified credentials

---

## 🎯 What Works in Mock Mode

✅ **Full UI Testing**
- All pages are accessible
- All components work
- Navigation works
- Theme switching works
- Logout works

✅ **Authentication Flow**
- OTP request (simulated)
- OTP verification (accepts "123456")
- Token storage
- Protected routes
- User profile display

❌ **What Doesn't Work**
- Real OTP sending (no SMS/email)
- Real API data for Users page
- Real user creation/editing
- Real data persistence

---

## 🧪 Testing the UI

Once logged in, you can test:

### 1. Dashboard
- Navigate to `/dashboard`
- See the welcome message
- View overview cards

### 2. Users Page
- Navigate to `/users`
- See the empty state (no API data in mock mode)
- Test search, filters, pagination controls
- Try creating a user (will show success but won't persist)

### 3. Profile Page
- Navigate to `/profile`
- See your logged-in user information
- Try editing (will show form but won't save in mock mode)

### 4. Header
- Click on user avatar (top right)
- See dropdown menu
- Test "Logout" functionality

### 5. Sidebar
- Click different menu items
- See active highlighting
- Test navigation between pages

---

## ⚠️ Important Notes

### Mock Mode Limitations:
1. **No Data Persistence** - Changes won't be saved to a database
2. **No Real OTP** - Always use "123456" as OTP
3. **Limited User Data** - Only 3 test users available
4. **API Calls Fail** - Backend API calls will fail (caught by error handlers)

### When to Switch to Real API:
- When you want to test actual data persistence
- When you want to test real OTP delivery
- When you want to test full CRUD operations with database
- When you're ready for integration testing

---

## 🔧 Troubleshooting

### Problem: "Invalid OTP" Error
**Solution**: Make sure you're using `123456` as the OTP in mock mode

### Problem: "User not found" Error
**Solution**: Use one of the three test phone numbers listed above

### Problem: Can't see data on Users page
**Solution**: This is expected in mock mode. The Users page tries to fetch from API which isn't available. You can still test the UI components.

### Problem: Changes not persisting
**Solution**: This is normal in mock mode. Switch to real API mode for data persistence.

### Problem: Application won't start
**Solution**: 
1. Check if another process is using port 3000
2. Run `npm install` to ensure dependencies are installed
3. Run `npm start` to start the dev server

---

## 📧 Quick Reference Card

```
╔════════════════════════════════════════╗
║     FINCORE WEBUI - TEST LOGIN         ║
╠════════════════════════════════════════╣
║ Mode: MOCK AUTHENTICATION              ║
║ URL:  http://localhost:3000/login      ║
╠════════════════════════════════════════╣
║ Test Users:                            ║
║                                        ║
║ Phone: 1234567890  | OTP: 123456      ║
║ Phone: 9876543210  | OTP: 123456      ║
║ Phone: 5555555555  | OTP: 123456      ║
║                                        ║
║ Any of these will work! ✓              ║
╚════════════════════════════════════════╝
```

---

## 🎉 You're All Set!

Mock authentication is now enabled. You can log in and explore all the UI pages without needing the backend API running.

**Next Steps:**
1. Open `http://localhost:3000/login`
2. Use phone `1234567890`
3. Use OTP `123456`
4. Explore the application!

When you're ready to connect to the real API, just change `MOCK_AUTH` to `false` in the config file.

Happy Testing! 🚀
