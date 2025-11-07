# Authentication Debug Guide

## What I Added

I've added comprehensive logging to track the authentication flow from frontend to backend. This will help you identify exactly where the 403 error is coming from.

## Where to Check Logs

**Open your browser console (F12)** while using the app. You'll see detailed logs for every API request.

## Log Flow (What You Should See)

### 1. When a Request Starts:
```
📡 [APIClient] Making request: {
  method: 'GET',
  url: 'http://localhost:8081/api/v1/speakers',
  endpoint: '/speakers',
  baseURL: 'http://localhost:8081/api/v1'
}
```
**What this tells you:** The URL is correctly formed

---

### 2. Auth Manager Gets Token:
```
🔑 [AuthManager] Getting access token...
🎫 [AuthManager] Token getter available, fetching from Clerk...
✅ [AuthManager] JWT token received: {
  length: 850,
  prefix: 'eyJhbGciOiJSUzI1NiIs...',
  suffix: '...kj3h2k1j3h'
}
```
**What this tells you:** Clerk is working and returning a JWT token

**⚠️ If you see this instead:**
```
⚠️ [AuthManager] No token getter available (Clerk not initialized?)
```
**Problem:** Clerk hooks are not set up. Check if `ClerkProvider` is wrapping your app.

**⚠️ Or this:**
```
⚠️ [AuthManager] No JWT token received from Clerk (user not signed in?)
```
**Problem:** You're not actually signed in, or Clerk session expired.

---

### 3. Building Auth Headers:
```
📋 [AuthManager] Building auth headers...
✅ [AuthManager] Auth header added: {
  hasToken: true,
  tokenLength: 850,
  bearerPrefix: 'Bearer eyJhbGci...'
}
```
**What this tells you:** The Authorization header is being created correctly

---

### 4. API Client Gets Headers:
```
🔐 [APIClient] Auth headers retrieved: {
  hasAuthorization: true,
  authHeaderLength: 857,
  authHeaderPrefix: 'Bearer eyJhbGciOiJS...'
}
```
**What this tells you:** Headers are passed to the HTTP client

---

### 5. Sending Request:
```
📤 [APIClient] Sending request with headers: {
  url: 'http://localhost:8081/api/v1/speakers',
  headers: ['Content-Type', 'Authorization'],
  hasAuth: true
}
```
**What this tells you:** Request is being sent with Authorization header

---

### 6A. Success Response:
```
📥 [APIClient] Response received: {
  status: 200,
  statusText: 'OK',
  ok: true,
  url: 'http://localhost:8081/api/v1/speakers'
}

✅ [APIClient] Request successful: {
  url: 'http://localhost:8081/api/v1/speakers',
  status: 200,
  hasData: true
}
```
**What this tells you:** Everything worked! ✅

---

### 6B. 403 Forbidden Response:
```
📥 [APIClient] Response received: {
  status: 403,
  statusText: 'Forbidden',
  ok: false,
  url: 'http://localhost:8081/api/v1/speakers'
}

❌ [APIClient] Request failed: {
  status: 403,
  statusText: 'Forbidden',
  errorText: 'insufficient privileges',
  url: 'http://localhost:8081/api/v1/speakers'
}

🚫 [APIClient] 403 Forbidden - insufficient privileges
Check if: {
  '1': 'JWT token is valid',
  '2': 'User has required permissions',
  '3': 'Backend Clerk configuration matches frontend'
}
```

**What this tells you:** The request reached the backend, but the JWT was rejected.

---

## Diagnosing 403 Errors

### If you see 403, check these in order:

1. **Copy the JWT token from the logs**
   - Look for the `prefix` in the AuthManager logs
   - Go to https://jwt.io
   - Paste the full token (from browser Network tab, Headers section)
   - Check if it's expired or invalid

2. **Compare Clerk configurations**
   - Frontend: `.env.local` has `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Backend: Check if Clerk secret key matches in `application-dev.yml`

3. **Check backend logs**
   ```bash
   # In elmify-backend directory
   # Look for JWT validation errors
   ```

4. **Verify user exists in backend**
   - The Clerk user ID must exist in your PostgreSQL `users` table
   - Backend might reject tokens for users not in the database

## Network Tab Inspection

Open DevTools → Network tab → Find the failed request → Click it → Check:

### Request Headers:
```
Authorization: Bearer eyJhbGci... (should be present)
```

### Response:
```
Status: 403
Body: "insufficient privileges" or similar error message
```

## Common Issues & Solutions

| Log Pattern | Problem | Solution |
|-------------|---------|----------|
| `No token getter available` | Clerk not initialized | Add `ClerkProvider` wrapper |
| `No JWT token received` | Not signed in | Sign in again |
| JWT token present but 403 | Token validation failed | Check Clerk keys match |
| No Authorization header | AuthManager issue | Check hook initialization |
| Request never sent | Network issue | Check backend is running |

## Testing Steps

1. **Open browser console (F12)**
2. **Sign in to your app with Clerk**
3. **Navigate to a page that loads speakers**
4. **Watch the console logs in order**
5. **Copy this guide and paste the logs you see**

## Quick Test

Run this in browser console to check auth status:
```javascript
// Check if Clerk is initialized
console.log('Clerk available:', window.Clerk !== undefined);

// Try to get token manually
if (window.Clerk) {
  window.Clerk.session?.getToken().then(token => {
    console.log('Manual token fetch:', token ? 'SUCCESS' : 'FAILED');
  });
}
```

---

**Now reload your app and check the browser console!** You'll see exactly what's happening with authentication.
