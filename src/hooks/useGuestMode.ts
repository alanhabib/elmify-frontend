/**
 * Hook for guest mode management
 */

import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import {
  guestModeManager,
  AccountRequiredFeature,
  ACCOUNT_REQUIRED_FEATURES
} from '@/store/guestMode';

/**
 * Hook to manage guest mode state
 */
export function useGuestMode() {
  const [isGuest, setIsGuest] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    // Initialize on mount
    const init = async () => {
      const guestMode = await guestModeManager.initialize();
      setIsGuest(guestMode);
      setIsInitialized(true);
    };
    init();

    // Subscribe to changes
    const unsubscribe = guestModeManager.subscribe((newIsGuest) => {
      setIsGuest(newIsGuest);
    });

    return unsubscribe;
  }, []);

  // Disable guest mode when user signs in
  useEffect(() => {
    if (isSignedIn && isGuest) {
      guestModeManager.disableGuestMode();
    }
  }, [isSignedIn, isGuest]);

  const enableGuestMode = useCallback(async () => {
    await guestModeManager.enableGuestMode();
    router.replace('/(protected)/(tabs)');
  }, [router]);

  const disableGuestMode = useCallback(async () => {
    await guestModeManager.disableGuestMode();
  }, []);

  /**
   * Prompt user to sign in for account-based features
   */
  const promptSignIn = useCallback((feature: AccountRequiredFeature) => {
    const featureNames: Record<AccountRequiredFeature, string> = {
      [ACCOUNT_REQUIRED_FEATURES.FAVORITES]: 'save favorites',
      [ACCOUNT_REQUIRED_FEATURES.PROGRESS_SYNC]: 'sync your progress',
      [ACCOUNT_REQUIRED_FEATURES.DOWNLOADS]: 'download for offline',
      [ACCOUNT_REQUIRED_FEATURES.PREMIUM_CONTENT]: 'access premium content',
      [ACCOUNT_REQUIRED_FEATURES.SETTINGS_SYNC]: 'sync your settings',
    };

    const featureName = featureNames[feature] || 'use this feature';

    Alert.alert(
      'Sign In Required',
      `Create a free account to ${featureName} and sync across devices.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign In',
          onPress: () => {
            guestModeManager.disableGuestMode();
            router.push('/sign-in');
          },
        },
      ]
    );
  }, [router]);

  /**
   * Check if user can access a feature, prompt if not
   * Returns true if allowed, false if blocked
   */
  const requireAuth = useCallback((feature: AccountRequiredFeature): boolean => {
    if (isSignedIn) return true;
    if (!isGuest) return true; // Not in guest mode and not signed in - shouldn't happen

    promptSignIn(feature);
    return false;
  }, [isSignedIn, isGuest, promptSignIn]);

  return {
    isGuest,
    isInitialized,
    isAuthenticated: isSignedIn === true,
    enableGuestMode,
    disableGuestMode,
    promptSignIn,
    requireAuth,
  };
}
