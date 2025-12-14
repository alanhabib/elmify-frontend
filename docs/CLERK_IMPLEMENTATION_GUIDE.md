# Clerk Authentication Implementation Guide for Production Podcast App

This guide provides a comprehensive approach to implementing Clerk authentication in a production podcast application (Spotify-like) with guest mode support.

---

## Architecture Recommendations

### Three-Tier Route Structure

```
src/app/
├── _layout.tsx                    # Root: ClerkProvider + ClerkLoaded check
├── (guest)/                       # Guest mode routes (no auth required)
│   ├── _layout.tsx               # Guest layout
│   ├── index.tsx                 # Browse podcasts (limited features)
│   ├── podcast/[id].tsx          # Listen to episodes
│   └── player.tsx                # Basic playback
├── (auth)/                        # Authentication flows
│   ├── _layout.tsx               # Redirect if signed in
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   └── verify.tsx
└── (protected)/                   # Premium features (auth required)
    ├── _layout.tsx               # Redirect if not signed in
    ├── library.tsx               # Saved podcasts
    ├── downloads.tsx             # Offline downloads
    ├── playlists.tsx
    └── profile.tsx
```

---

## 1. Guest Mode Implementation

### Guest Layout Pattern

```tsx
// (guest)/_layout.tsx
import { Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { Link } from "expo-router";

export default function GuestLayout() {
  const { isSignedIn } = useAuth();

  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerRight: () =>
            !isSignedIn && <Link href="/sign-in">Sign In</Link>,
        }}
      />
    </Stack>
  );
}
```

### Feature Gating in Components

```tsx
// In any screen
import { useAuth } from "@clerk/clerk-expo";

const { isSignedIn } = useAuth();

const handleSavePodcast = () => {
  if (!isSignedIn) {
    // Show modal: "Sign in to save podcasts"
    showAuthModal();
    return;
  }
  // Proceed with save
};
```

---

## 2. Production Environment Setup

### Environment Variables

Create `.env` file:

```bash
# Clerk
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxx
CLERK_SECRET_KEY=sk_live_xxx  # Backend only

# Deep linking
EXPO_PUBLIC_APP_SCHEME=yourpodcastapp
```

### Clerk Dashboard Configuration

1. **Enable OAuth Providers**: Google, Apple (required for iOS), Facebook
2. **Set Redirect URIs**:
   - Development: `exp://localhost:8081` (Expo Go)
   - Production: `yourpodcastapp://` (custom scheme)
3. **Configure User Profile**: Enable firstName, lastName, profileImage
4. **Email Settings**: Customize verification emails with your branding
5. **Session Management**: Set token lifetime (default 7 days is good)

---

## 3. Critical Production Patterns

### Root Layout with ClerkProvider

```tsx
// src/app/_layout.tsx
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Slot } from "expo-router";

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
      tokenCache={tokenCache}
    >
      <Slot />
    </ClerkProvider>
  );
}
```

### Protected Routes Layout

```tsx
// (protected)/_layout.tsx
import { Slot, Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { ActivityIndicator, View } from "react-native";

export default function ProtectedLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  return <Slot />;
}
```

### Auth Routes Layout

```tsx
// (auth)/_layout.tsx
import { Stack, Redirect } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { ActivityIndicator, View } from "react-native";

export default function AuthLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (isSignedIn) {
    return <Redirect href={"/"} />;
  }

  return <Stack />;
}
```

---

## 4. Authenticated API Requests

### Frontend: Getting Auth Token

```tsx
import { useAuth } from "@clerk/clerk-expo";

const { getToken } = useAuth();

const fetchUserPlaylists = async () => {
  const token = await getToken();

  const response = await fetch("https://api.yourpodcast.com/playlists", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
};
```

### Backend: Token Verification (Node.js)

```typescript
import { clerkClient } from "@clerk/clerk-sdk-node";

app.get("/api/playlists", async (req, res) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  try {
    const session = await clerkClient.sessions.verifySession(token);
    const userId = session.userId;

    // Fetch user's playlists
    const playlists = await db.playlists.findMany({ userId });
    res.json(playlists);
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
});
```

---

## 5. Guest-to-Authenticated Migration

### Preserve Guest Activity

```tsx
import { useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

const { user } = useUser();

useEffect(() => {
  if (user) {
    // Migrate guest data to authenticated user
    const migrateGuestData = async () => {
      const guestListeningHistory = await AsyncStorage.getItem("guestHistory");
      if (guestListeningHistory) {
        await syncGuestDataToBackend(user.id, guestListeningHistory);
        await AsyncStorage.removeItem("guestHistory");
      }
    };

    migrateGuestData();
  }
}, [user]);
```

---

## 6. Feature Gating Strategy

### Create a Feature Access Hook

```tsx
// hooks/useFeatureAccess.ts
import { useAuth } from "@clerk/clerk-expo";

export const useFeatureAccess = () => {
  const { isSignedIn } = useAuth();

  return {
    canDownload: isSignedIn,
    canCreatePlaylists: isSignedIn,
    canSync: isSignedIn,
    canAccessHistory: isSignedIn,
    hasAds: !isSignedIn, // Show ads for guests
    playbackQuality: isSignedIn ? "high" : "standard",
  };
};
```

### Usage in Components

```tsx
import { useFeatureAccess } from "@/hooks/useFeatureAccess";

const PodcastScreen = () => {
  const { canDownload, hasAds } = useFeatureAccess();

  return (
    <>
      {hasAds && <AdBanner />}

      <Button
        onPress={handleDownload}
        disabled={!canDownload}
        title={canDownload ? "Download" : "Sign in to download"}
      />
    </>
  );
};
```

---

## 7. OAuth Provider Setup

### Multi-Platform OAuth Configuration

```tsx
// components/SignInOptions.tsx
import { Platform } from "react-native";
import { useSSO } from "@clerk/clerk-expo";

const providers = Platform.select({
  ios: [
    { name: "Apple", strategy: "oauth_apple", required: true },
    { name: "Google", strategy: "oauth_google" },
  ],
  android: [
    { name: "Google", strategy: "oauth_google" },
    { name: "Facebook", strategy: "oauth_facebook" },
  ],
});

export const SocialSignIn = () => {
  const { startSSOFlow } = useSSO();

  const handleOAuthSignIn = async (strategy: string) => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
        redirectUrl: AuthSession.makeRedirectUri(),
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (err) {
      console.error("OAuth error:", err);
    }
  };

  return (
    <>
      {providers.map((provider) => (
        <Button
          key={provider.strategy}
          onPress={() => handleOAuthSignIn(provider.strategy)}
          title={`Sign in with ${provider.name}`}
        />
      ))}
    </>
  );
};
```

### iOS Configuration

**File: `ios/YourApp/Info.plist`**

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>yourpodcastapp</string>
    </array>
  </dict>
</array>
```

**Note**: Apple Sign In is **mandatory** for App Store if you offer other social login options.

---

## 8. Error Handling & UX

### Comprehensive Error Handling

```tsx
import { isClerkAPIResponseError } from "@clerk/clerk-expo";

const handleSignIn = async (email: string, password: string) => {
  try {
    const signInAttempt = await signIn.create({
      identifier: email,
      password: password,
    });

    if (signInAttempt.status === "complete") {
      await setActive({ session: signInAttempt.createdSessionId });
    }
  } catch (err) {
    if (isClerkAPIResponseError(err)) {
      // Handle Clerk-specific errors
      err.errors.forEach((error) => {
        const fieldName = error.meta?.paramName || "root";
        setError(fieldName, { message: error.longMessage });
      });
    } else if (err.message.includes("Network")) {
      // Handle offline mode
      showToast("No internet connection. Please try again.");
    } else {
      // Unknown error - log to monitoring service
      logErrorToMonitoring(err);
      showToast("An unexpected error occurred");
    }
  }
};
```

### Error Field Mapping

```tsx
const mapClerkErrorToFormField = (error: any) => {
  switch (error.meta?.paramName) {
    case "identifier": // For sign-in
    case "email_address": // For sign-up
      return "email";
    case "password":
      return "password";
    case "code": // For verification
      return "code";
    default:
      return "root"; // General errors
  }
};
```

---

## 9. Analytics Integration

### Track Authentication Events

```tsx
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useEffect } from "react";
import analytics from "@/services/analytics";

export const useAuthAnalytics = () => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  useEffect(() => {
    if (isSignedIn && user) {
      // Identify user in analytics
      analytics.identify(user.id, {
        email: user.primaryEmailAddress?.emailAddress,
        name: user.fullName,
        createdAt: user.createdAt,
      });

      analytics.track("User Signed In", {
        method: user.externalAccounts?.[0]?.provider || "email",
      });
    } else {
      // Track as anonymous
      analytics.reset();
    }
  }, [isSignedIn, user]);
};
```

---

## 10. Sign-Up Flow

### Email/Password Sign-Up

```tsx
import { useSignUp } from '@clerk/clerk-expo';
import { router } from 'expo-router';

export default function SignUpScreen() {
  const { signUp, setActive } = useSignUp();

  const handleSignUp = async (email: string, password: string) => {
    try {
      // Create sign-up
      await signUp.create({
        emailAddress: email,
        password: password,
      });

      // Trigger email verification
      await signUp.prepareVerification({
        strategy: 'email_code'
      });

      // Navigate to verification screen
      router.push('/verify');
    } catch (err) {
      handleError(err);
    }
  };

  return (
    // Your sign-up form UI
  );
}
```

### Email Verification

```tsx
import { useSignUp } from '@clerk/clerk-expo';

export default function VerifyScreen() {
  const { signUp, setActive } = useSignUp();

  const handleVerification = async (code: string) => {
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        // User is now authenticated, router will redirect automatically
      }
    } catch (err) {
      handleError(err);
    }
  };

  return (
    // Your verification form UI
  );
}
```

---

## 11. Sign-In Flow

### Email/Password Sign-In

```tsx
import { useSignIn } from '@clerk/clerk-expo';

export default function SignInScreen() {
  const { signIn, setActive } = useSignIn();

  const handleSignIn = async (email: string, password: string) => {
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password: password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        // User is authenticated, router will redirect
      }
    } catch (err) {
      handleError(err);
    }
  };

  return (
    // Your sign-in form UI
  );
}
```

---

## 12. User Profile Management

### Display User Information

```tsx
import { useUser } from "@clerk/clerk-expo";

export default function ProfileScreen() {
  const { user } = useUser();

  return (
    <View>
      <Image source={{ uri: user?.imageUrl }} />
      <Text>{user?.fullName}</Text>
      <Text>{user?.primaryEmailAddress?.emailAddress}</Text>
    </View>
  );
}
```

### Update User Profile

```tsx
import { useUser } from "@clerk/clerk-expo";

const { user } = useUser();

const updateProfile = async (firstName: string, lastName: string) => {
  try {
    await user?.update({
      firstName,
      lastName,
    });
  } catch (err) {
    handleError(err);
  }
};
```

---

## 13. Sign Out

```tsx
import { useAuth } from "@clerk/clerk-expo";

export const SignOutButton = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Router will automatically redirect to guest/auth routes
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return <Button onPress={handleSignOut} title="Sign Out" />;
};
```

---

## 14. Testing Strategy

### Test Coverage Checklist

**Guest Mode:**

- [ ] Browse podcasts without authentication
- [ ] Play episodes without account
- [ ] See "Sign in" prompts for premium features
- [ ] Navigate freely in guest area

**Authentication:**

- [ ] Sign up with email/password
- [ ] Verify email with code
- [ ] Sign in with email/password
- [ ] Sign in with Google OAuth
- [ ] Sign in with Apple OAuth (iOS)
- [ ] Error handling for invalid credentials
- [ ] Error handling for network failures

**Protected Features:**

- [ ] Save podcasts (requires auth)
- [ ] Create playlists (requires auth)
- [ ] Download episodes (requires auth)
- [ ] Sync across devices (requires auth)

**Migration:**

- [ ] Guest listening history transfers to account
- [ ] Guest preferences preserved after sign-up
- [ ] No data loss during migration

**Offline:**

- [ ] Cached tokens work without network
- [ ] Downloaded episodes play offline
- [ ] Graceful degradation when offline

---

## 15. Implementation Timeline

### Week 1: Basic Clerk Setup

- [ ] Install dependencies
- [ ] Configure ClerkProvider
- [ ] Set up environment variables
- [ ] Create basic auth screens (sign-in, sign-up, verify)

### Week 2: Guest Mode Routes

- [ ] Create (guest) route group
- [ ] Implement browse/discover screens
- [ ] Add basic playback without auth
- [ ] Create feature gating hooks

### Week 3: OAuth Providers

- [ ] Configure Apple Sign In (iOS)
- [ ] Configure Google Sign In
- [ ] Set up OAuth redirect URIs
- [ ] Test OAuth flows

### Week 4: Guest-to-Auth Migration

- [ ] Implement guest data tracking (AsyncStorage)
- [ ] Create migration service
- [ ] Sync guest data to backend on sign-up
- [ ] Test data preservation

### Week 5: Backend Integration

- [ ] Set up backend token verification
- [ ] Secure API endpoints
- [ ] Implement user data sync
- [ ] Test authenticated requests

### Week 6: Error Handling & Offline

- [ ] Add comprehensive error handling
- [ ] Implement offline mode detection
- [ ] Add retry logic for network failures
- [ ] Test edge cases

### Week 7: Testing & Analytics

- [ ] Write integration tests
- [ ] Add analytics tracking
- [ ] Performance testing
- [ ] Bug fixes and polish

---

## 16. Key Differences from Sample App

| Aspect                    | Sample App      | Production Podcast App            |
| ------------------------- | --------------- | --------------------------------- |
| **Guest Access**          | No guest mode   | Full browse/play without auth     |
| **Feature Gating**        | Hard redirects  | Soft prompts + hard gates         |
| **Data Migration**        | N/A             | Guest → Auth data transfer        |
| **Monetization**          | None            | Ads for guests, premium for users |
| **Offline Support**       | Not implemented | Downloads + offline playback      |
| **Platform Requirements** | Demo only       | Apple Sign In mandatory (iOS)     |

---

## 17. Dependencies Required

```json
{
  "dependencies": {
    "@clerk/clerk-expo": "^2.9.6",
    "expo-secure-store": "^14.0.1",
    "expo-web-browser": "~14.0.2",
    "expo-auth-session": "~6.0.3",
    "expo-crypto": "~14.0.2",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "expo-router": "~4.0.0"
  }
}
```

Install with:

```bash
npx expo install @clerk/clerk-expo expo-secure-store expo-web-browser expo-auth-session expo-crypto @react-native-async-storage/async-storage
```

---

## 18. Security Best Practices

### Token Storage

✅ **DO**: Use `tokenCache` from `@clerk/clerk-expo/token-cache`  
✅ **DO**: Tokens stored in iOS Keychain / Android Keystore  
❌ **DON'T**: Store tokens in AsyncStorage (not secure)  
❌ **DON'T**: Store tokens in Redux/Zustand (memory only)

### API Security

✅ **DO**: Verify tokens on backend for every request  
✅ **DO**: Use HTTPS for all API calls  
✅ **DO**: Implement rate limiting  
❌ **DON'T**: Trust client-side auth state for critical operations  
❌ **DON'T**: Expose Clerk secret key in frontend code

### OAuth Security

✅ **DO**: Use PKCE flow (automatic with Clerk)  
✅ **DO**: Validate redirect URIs in Clerk Dashboard  
✅ **DO**: Handle OAuth errors gracefully  
❌ **DON'T**: Use custom OAuth implementations  
❌ **DON'T**: Store OAuth tokens manually

---

## 19. Common Issues & Solutions

### Issue: "Invalid publishable key"

**Solution**: Check that `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` is set correctly and starts with `pk_`

### Issue: OAuth redirect not working

**Solution**:

1. Verify URL scheme matches in `app.json` and Clerk Dashboard
2. Check `CFBundleURLSchemes` in iOS `Info.plist`
3. Ensure `WebBrowser.maybeCompleteAuthSession()` is called

### Issue: "Session expired" errors

**Solution**: Implement token refresh logic:

```tsx
const { getToken } = useAuth();
const token = await getToken({ skipCache: true }); // Force refresh
```

### Issue: Guest data not migrating

**Solution**: Ensure migration happens in `useEffect` after user is loaded:

```tsx
useEffect(() => {
  if (user?.id) {
    migrateGuestData();
  }
}, [user?.id]);
```

---

## 20. Resources

- **Clerk Documentation**: https://clerk.com/docs
- **Expo Router**: https://docs.expo.dev/router/introduction/
- **Clerk Expo Template**: https://github.com/clerk/clerk-expo-starter
- **Sample App (this repo)**: Reference implementation patterns

---

## Summary

This guide provides a production-ready approach to implementing Clerk authentication in a podcast application with:

✅ Guest mode for unauthenticated browsing  
✅ Seamless guest-to-authenticated migration  
✅ Feature gating with premium access control  
✅ Multi-platform OAuth (Apple, Google, Facebook)  
✅ Secure token storage and API authentication  
✅ Comprehensive error handling  
✅ Analytics integration  
✅ Offline support

Follow the implementation timeline and test thoroughly before production deployment.
