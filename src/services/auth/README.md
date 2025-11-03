# 🔐 Enhanced Authentication System

## Overview

The enhanced authentication system provides seamless integration between Clerk authentication and API services, with automatic token management, refresh, and error handling.

## Architecture

- **AuthManager**: Singleton class that manages tokens globally
- **useAuthManager**: React hook that bridges Clerk with AuthManager  
- **Enhanced APIClient**: Uses AuthManager for all API requests

## Quick Setup

### 1. Initialize Authentication in App Root

```tsx
// src/app/_layout.tsx or your root component
import { useAuthManager } from '@/hooks/auth/useAuthManager';

export default function RootLayout() {
  // Initialize auth manager with Clerk
  const { isLoading, isAuthenticated } = useAuthManager();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <QueryProvider>
        <PlayerProvider>
          {/* Your app content */}
        </PlayerProvider>
      </QueryProvider>
    </ClerkProvider>
  );
}
```

### 2. Use Authentication in Components

```tsx
import { useIsAuthenticated, useCurrentUser } from '@/hooks/auth/useAuthManager';

function ProfileScreen() {
  const isAuthenticated = useIsAuthenticated();
  const user = useCurrentUser();

  if (!isAuthenticated) {
    return <SignInPrompt />;
  }

  return (
    <View>
      <Text>Welcome {user?.firstName}!</Text>
    </View>
  );
}
```

### 3. API Services Work Automatically

```tsx
// All API services now automatically use proper authentication
import { PlaybackPositionAPI, UserFavoritesAPI } from '@/services/api';

function AudioPlayer({ lectureId }: { lectureId: string }) {
  const savePosition = async (position: number) => {
    // Automatically uses authenticated requests
    await PlaybackPositionAPI.savePosition(lectureId, position);
  };

  const toggleFavorite = async () => {
    // Handles auth errors automatically
    await UserFavoritesAPI.toggleLecture(lectureId);
  };

  // ... rest of component
}
```

## Features

### ✅ **Automatic Token Management**
- Fetches tokens from Clerk automatically
- Handles token refresh behind the scenes
- Falls back to demo tokens in development

### ✅ **Seamless API Integration**
- All API services use authenticated requests
- No manual token handling required
- Automatic retry on auth errors

### ✅ **Error Handling** 
- Detects 401 auth errors
- Automatically refreshes tokens
- Retries failed requests once
- Graceful fallbacks

### ✅ **Development Support**
- Demo tokens for offline development
- Detailed logging for debugging
- Fallback mechanisms

## Advanced Usage

### Manual Token Operations

```tsx
import { useAuthUtils } from '@/hooks/auth/useAuthManager';

function AdvancedComponent() {
  const { getToken, refreshToken, clearTokens } = useAuthUtils();

  const handleManualRefresh = async () => {
    const newToken = await refreshToken();
    console.log('New token:', newToken);
  };

  const handleLogout = () => {
    clearTokens();
    // Redirect to login
  };
}
```

### Listen to Auth State Changes

```tsx
import { AuthManager } from '@/services/auth/authManager';

useEffect(() => {
  const unsubscribe = AuthManager.subscribe((state) => {
    console.log('Auth state changed:', state);
    
    if (!state.isAuthenticated) {
      // Handle logout
    }
  });

  return unsubscribe;
}, []);
```

## Migration from Old System

The old APIClient demo token system is completely replaced. No code changes required for existing API calls - they'll automatically use the new authentication system.

## Troubleshooting

### Development Issues
- **"Using demo token"**: Normal in development mode
- **Auth errors**: Check Clerk configuration and API keys

### Production Issues  
- **401 errors**: Verify Clerk secret key in backend
- **Token refresh fails**: Check Clerk session configuration

### Debug Mode

Enable detailed auth logging:

```tsx
// In development
console.log('Auth state:', AuthManager.getAuthState());
console.log('Current token:', await AuthManager.getAccessToken());
```

## Security Notes

- ✅ Tokens are managed in memory only
- ✅ Automatic token refresh prevents stale tokens
- ✅ Demo tokens only in development mode
- ✅ Proper error handling prevents token leakage