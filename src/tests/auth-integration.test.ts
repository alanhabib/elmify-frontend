/**
 * Authentication Integration Test
 * Verifies that the client works seamlessly with the secured backend
 */

import { AuthManager } from '@/services/auth/authManager';
import { SpeakerEndpoints } from '@/services/api/endpoints/speakerEndpoints';
import { CollectionEndpoints } from '@/services/api/endpoints/collectionEndpoints';
import { LectureEndpoints } from '@/services/api/endpoints/lectureEndpoints';
import { StreamingAPI } from '@/services/api/core/streamingAPI';

// Mock Clerk for testing
const mockClerkAuth = {
  isSignedIn: true,
  isLoaded: true,
  getToken: jest.fn().mockResolvedValue('mock-jwt-token'),
  user: { id: 'user_123', email: 'test@example.com' }
};

describe('Authentication Integration', () => {
  beforeEach(() => {
    // Initialize AuthManager with mock Clerk functions
    AuthManager.initialize(
      mockClerkAuth.getToken,
      () => mockClerkAuth.user,
      () => ({ isSignedIn: mockClerkAuth.isSignedIn, isLoaded: mockClerkAuth.isLoaded })
    );
  });

  describe('API Client Authentication', () => {
    it('should include auth headers in requests', async () => {
      const headers = await AuthManager.getAuthHeaders();
      
      expect(headers).toHaveProperty('Authorization');
      expect(headers.Authorization).toBe('Bearer mock-jwt-token');
      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should handle authentication state correctly', () => {
      expect(AuthManager.isAuthenticated()).toBe(true);
      expect(AuthManager.getCurrentUser()).toEqual(mockClerkAuth.user);
    });
  });

  describe('Secured API Endpoints', () => {
    // Mock fetch for API calls
    beforeEach(() => {
      global.fetch = jest.fn();
    });

    it('should call speaker endpoints with authentication', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve([
          { id: 1, name: 'Test Speaker', bio: 'Test Bio' }
        ])
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SpeakerEndpoints.getAll();
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/catalog/speakers'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-jwt-token'
          })
        })
      );
    });

    it('should call collection endpoints with authentication', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve([
          { id: 1, title: 'Test Collection' }
        ])
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await CollectionEndpoints.getBySpeaker('1');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/catalog/collections/speaker/1'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-jwt-token'
          })
        })
      );
    });

    it('should call lecture endpoints with authentication', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve([
          { id: 1, title: 'Test Lecture' }
        ])
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await LectureEndpoints.getByCollection('1');
      
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/catalog/lectures/collection/1'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-jwt-token'
          })
        })
      );
    });

    it('should handle streaming URLs with authentication', async () => {
      const streamingUrl = await StreamingAPI.getAuthenticatedStreamingUrl('123');
      
      expect(streamingUrl).toContain('/catalog/lectures/stream/123');
      expect(streamingUrl).toContain('token=mock-jwt-token');
    });
  });

  describe('Error Handling', () => {
    it('should handle 401 authentication errors', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Unauthorized')
      };
      
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await SpeakerEndpoints.getAll();
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('HTTP 401');
    });

    it('should retry with refreshed token on auth error', async () => {
      // First call fails with 401, second succeeds
      const failResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: () => Promise.resolve('Unauthorized')
      };
      
      const successResponse = {
        ok: true,
        json: () => Promise.resolve([{ id: 1, name: 'Test Speaker' }])
      };
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce(failResponse)
        .mockResolvedValueOnce(successResponse);

      const result = await SpeakerEndpoints.getAll();
      
      // Should have called fetch twice (retry)
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe('Unauthenticated State', () => {
    beforeEach(() => {
      // Simulate unauthenticated state
      AuthManager.initialize(
        () => Promise.resolve(null),
        () => null,
        () => ({ isSignedIn: false, isLoaded: true })
      );
    });

    it('should handle missing authentication gracefully', async () => {
      expect(AuthManager.isAuthenticated()).toBe(false);
      
      const headers = await AuthManager.getAuthHeaders();
      expect(headers).not.toHaveProperty('Authorization');
    });
  });
});

export {};