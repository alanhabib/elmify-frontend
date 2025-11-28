/**
 * Guest Mode State Management
 *
 * Handles guest mode state using AsyncStorage for persistence.
 * Allows users to browse and listen without creating an account.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

const GUEST_MODE_KEY = "@elmify_guest_mode";

class GuestModeManager {
  private isGuest: boolean = false;
  private listeners: Set<(isGuest: boolean) => void> = new Set();
  private initialized: boolean = false;

  /**
   * Initialize guest mode from storage
   */
  async initialize(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(GUEST_MODE_KEY);
      this.isGuest = value === "true";
      this.initialized = true;
      return this.isGuest;
    } catch (error) {
      console.error("[GuestMode] Failed to initialize:", error);
      this.initialized = true;
      return false;
    }
  }

  /**
   * Enable guest mode
   */
  async enableGuestMode(): Promise<void> {
    try {
      await AsyncStorage.setItem(GUEST_MODE_KEY, "true");
      this.isGuest = true;
      this.notifyListeners();
    } catch (error) {
      console.error("[GuestMode] Failed to enable:", error);
    }
  }

  /**
   * Disable guest mode (when user signs in)
   */
  async disableGuestMode(): Promise<void> {
    try {
      await AsyncStorage.removeItem(GUEST_MODE_KEY);
      this.isGuest = false;
      this.notifyListeners();
    } catch (error) {
      console.error("[GuestMode] Failed to disable:", error);
    }
  }

  /**
   * Check if currently in guest mode
   */
  isGuestMode(): boolean {
    return this.isGuest;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Subscribe to guest mode changes
   */
  subscribe(listener: (isGuest: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.isGuest);
      } catch (error) {
        // Ignore listener errors
      }
    });
  }
}

export const guestModeManager = new GuestModeManager();

/**
 * Features that require authentication
 */
export const ACCOUNT_REQUIRED_FEATURES = {
  FAVORITES: "favorites",
  PROGRESS_SYNC: "progress_sync",
  DOWNLOADS: "downloads",
  PREMIUM_CONTENT: "premium_content",
  SETTINGS_SYNC: "settings_sync",
} as const;

export type AccountRequiredFeature =
  typeof ACCOUNT_REQUIRED_FEATURES[keyof typeof ACCOUNT_REQUIRED_FEATURES];
