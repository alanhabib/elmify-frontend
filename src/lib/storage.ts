import { Platform } from 'react-native';

// Cross-platform storage that works with React Native and Web
class CrossPlatformStorage {
  private asyncStorage: any = null;

  constructor() {
    // Only import AsyncStorage for native platforms
    if (Platform.OS !== 'web') {
      try {
        this.asyncStorage = require('@react-native-async-storage/async-storage').default;
      } catch (error) {
        console.warn('AsyncStorage not available:', error);
      }
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key);
      } else if (this.asyncStorage) {
        return await this.asyncStorage.getItem(key);
      }
      return null;
    } catch (error) {
      console.warn('Storage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else if (this.asyncStorage) {
        await this.asyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('Storage setItem error:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
      } else if (this.asyncStorage) {
        await this.asyncStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('Storage removeItem error:', error);
    }
  }
}

export const storage = new CrossPlatformStorage();