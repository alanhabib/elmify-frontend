import { useEffect, useState, useRef } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { AuthManager, AuthState } from "@/services/auth/authManager";
import { useSyncUser } from "@/queries/hooks/user";

/**
 * React hook that bridges Clerk authentication with our AuthManager
 *
 * Initializes the AuthManager with Clerk hooks and provides auth state
 * Use this hook in your root component to set up authentication
 */

export const useAuthManager = () => {
  const { getToken, isSignedIn, isLoaded, signOut } = useAuth();
  const { user } = useUser();
  const [authState, setAuthState] = useState<AuthState>(() =>
    AuthManager.getAuthState()
  );
  const syncMutation = useSyncUser();
  const hasSynced = useRef(false);

  // Initialize AuthManager with Clerk functions
  useEffect(() => {
    AuthManager.initialize(
      // Token getter
      async () => {
        try {
          const token = await getToken();
          return token;
        } catch (error) {
          console.warn("Failed to get token from Clerk:", error);
          return null;
        }
      },
      // User getter
      () => user,
      // Auth state getter
      () => ({ isSignedIn: !!isSignedIn, isLoaded: !!isLoaded })
    );
  }, [getToken, user, isSignedIn, isLoaded]);

  // Subscribe to AuthManager state changes
  useEffect(() => {
    const unsubscribe = AuthManager.subscribe((newState) => {
      setAuthState(newState);
    });

    // Update state immediately with current state
    setAuthState(AuthManager.getAuthState());

    return unsubscribe;
  }, []);

  // Update auth state when Clerk state changes
  useEffect(() => {
    setAuthState(AuthManager.getAuthState());
  }, [isSignedIn, isLoaded, user]);

  // Sync user with backend after successful authentication
  useEffect(() => {
    if (isSignedIn && user && !hasSynced.current && !syncMutation.isPending) {
      hasSynced.current = true;

      syncMutation.mutate({
        clerkId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        fullName: user.fullName || undefined,
        profileImageUrl: user.imageUrl || undefined,
      });
    }
  }, [isSignedIn, user, syncMutation]);

  // Reset sync flag when user signs out
  useEffect(() => {
    if (!isSignedIn) {
      hasSynced.current = false;
    }
  }, [isSignedIn]);

  return {
    // Current auth state
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    user: authState.user,

    // Clerk state for compatibility
    isSignedIn,
    isLoaded,

    // Auth actions
    signOut: async () => {
      await signOut();
      AuthManager.clearTokens();
    },

    // Token management
    getToken: () => AuthManager.getAccessToken(),
    refreshToken: () => AuthManager.forceRefresh(),

    // AuthManager instance for advanced usage
    authManager: AuthManager,
  };
};

/**
 * Hook for components that just need to know if user is authenticated
 */
export const useIsAuthenticated = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    AuthManager.isAuthenticated()
  );

  useEffect(() => {
    const unsubscribe = AuthManager.subscribe((state) => {
      setIsAuthenticated(state.isAuthenticated);
    });

    setIsAuthenticated(AuthManager.isAuthenticated());

    return unsubscribe;
  }, []);

  return isAuthenticated;
};

/**
 * Hook for components that need the current user
 */
export const useCurrentUser = () => {
  const [user, setUser] = useState(() => AuthManager.getCurrentUser());

  useEffect(() => {
    const unsubscribe = AuthManager.subscribe((state) => {
      setUser(state.user);
    });

    setUser(AuthManager.getCurrentUser());

    return unsubscribe;
  }, []);

  return user;
};

/**
 * Hook that provides auth utilities
 */
export const useAuthUtils = () => {
  return {
    getToken: () => AuthManager.getAccessToken(),
    refreshToken: () => AuthManager.forceRefresh(),
    isAuthenticated: () => AuthManager.isAuthenticated(),
    getCurrentUser: () => AuthManager.getCurrentUser(),
    getAuthState: () => AuthManager.getAuthState(),
    clearTokens: () => AuthManager.clearTokens(),
  };
};
