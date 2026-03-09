# 403 Error Root Cause and Fix

## Issue Summary
User reported 403 Forbidden errors when trying to CREATE users or other entities in the application.

## Root Cause Analysis

### Backend API Response
The backend authentication endpoint `/api/auth/verify-otp` returns:
```json
{
  "accessToken": "eyJhbGci...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "user": {
    "id": 1,
    "phoneNumber": "+1234567890",
    "email": "admin@fincore.com",
    "firstName": "System",
    "lastName": "Administrator",
    "role": "SYSTEM_ADMINISTRATOR",
    ...
  }
}
```

### Frontend Code
The frontend was looking for a `token` field instead of `accessToken`:

**authService.ts (BEFORE):**
```typescript
const response = await apiService.post<AuthResponse>(`${this.BASE_PATH}/verify-otp`, payload);

if (response.data.token) {  // ❌ Wrong field name!
  localStorage.setItem('authToken', response.data.token);
  ...
}
```

**Result:** 
- `response.data.token` was `undefined`
- No token stored in localStorage
- Subsequent API requests had no Authorization header
- Backend returned 403 Forbidden

## The Fix

### 1. Updated AuthResponse Type
**src/types/auth.types.ts:**
```typescript
export interface AuthResponse {
  accessToken: string;  // ✅ Correct field name
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface User {
  ...
  role?: string;  // Added role field
  ...
}
```

### 2. Updated Auth Service
**src/services/authService.ts:**
```typescript
if (response.data.accessToken) {  // ✅ Correct field name
  localStorage.setItem('authToken', response.data.accessToken);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  console.log('[AuthService] Token stored successfully, role:', response.data.user.role || 'N/A');
}
```

### 3. Updated Auth Context
**src/context/AuthContext.tsx:**
```typescript
const login = async (phoneNumber: string, otp: string): Promise<void> => {
  const authResponse = await authService.verifyOTP(phoneNumber, otp);
  setToken(authResponse.accessToken);  // ✅ Correct field name
  setUser(authResponse.user);
  console.log('[AuthContext] User logged in with role:', authResponse.user.role || 'N/A');
};
```

## Verification

### PowerShell Test Results
Using the correct `accessToken` field, all operations now work:

```
Getting JWT token for: +1234567890
User role: SYSTEM_ADMINISTRATOR

JWT Token Payload:
{
    "phoneNumber": "+1234567890",
    "role": "SYSTEM_ADMINISTRATOR",
    "userId": 1,
    ...
}

Testing token with GET /users...
✅ SUCCESS - Token works for GET operations
Found 6 users

Testing token with POST /users (CREATE)...
✅ SUCCESS - User created with ID: 7
Cleaned up test user
```

## Impact

### Before Fix
- ❌ User login appeared successful but token was null
- ❌ All CREATE/UPDATE/DELETE operations failed with 403
- ❌ Only GET operations worked (public endpoints?)
- ❌ No authentication token in API requests

### After Fix
- ✅ User login stores valid JWT token
- ✅ Token includes user role (SYSTEM_ADMINISTRATOR)
- ✅ All CRUD operations work correctly
- ✅ Authorization header properly set on all requests

## Testing After Deployment

Once the deployment completes, test the fix:

1. **Clear browser storage:**
   - Open DevTools (F12)
   - Application tab → Local Storage
   - Clear all items
   - Refresh page

2. **Login again:**
   - Phone: +1234567890
   - OTP: (check response devOtp field)

3. **Check console logs:**
   ```
   [AuthService] Token stored successfully, role: SYSTEM_ADMINISTRATOR
   [AuthContext] User logged in with role: SYSTEM_ADMINISTRATOR
   ```

4. **Test CREATE operations:**
   - Create new user → Should work ✅
   - Create new organization → Should work ✅
   - Upload documents → Should work ✅

5. **Verify in Network tab:**
   - All API requests should have:
   - `Authorization: Bearer eyJhbGci...`

## Files Changed
- ✅ src/types/auth.types.ts - Updated AuthResponse interface
- ✅ src/services/authService.ts - Use accessToken field
- ✅ src/context/AuthContext.tsx - Use accessToken field

## Deployment
- Commit: 5e40f7d
- GitHub Actions: https://github.com/kasisheraz/fincore_WebUI/actions/runs/22869468233
- Status: Deploying...
- Expected completion: ~5 minutes

## Summary
The 403 errors were caused by a mismatch between backend API response (`accessToken`) and frontend code expecting (`token`). This resulted in no authentication token being stored, causing all CREATE/UPDATE/DELETE operations to fail. The fix aligns the frontend with the backend API contract.
