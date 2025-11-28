/**
 * User Query Hooks
 *
 * TanStack Query hooks for user profile and preferences
 * All hooks require authentication
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as userAPI from "@/api/endpoints/user";
import { queryKeys } from "@/queries/keys";
import type { UserPreferences, UserResponse } from "@/api/endpoints/user";

/**
 * Get current user profile
 * Returns authenticated user's profile including preferences
 */
export function useCurrentUser(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: async () => {
      const response = await userAPI.getCurrentUser();

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to fetch user profile");
      }

      return response.data!;
    },
    enabled,
    staleTime: 3000000, // 50 minutes
    gcTime: 6000000, // 100 minutes
  });
}

/**
 * Update user preferences
 * Optimistically updates the cache
 */
export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: UserPreferences) => {
      const response = await userAPI.updatePreferences(preferences);

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to update preferences");
      }

      return response.data!;
    },
    onMutate: async (newPreferences) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.user.profile() });

      // Snapshot previous value
      const previousUser = queryClient.getQueryData<UserResponse>(
        queryKeys.user.profile()
      );

      // Optimistically update
      if (previousUser) {
        queryClient.setQueryData<UserResponse>(queryKeys.user.profile(), {
          ...previousUser,
          preferences: newPreferences,
        });
      }

      return { previousUser };
    },
    onError: (_err, _newPreferences, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(
          queryKeys.user.profile(),
          context.previousUser
        );
      }
    },
    onSuccess: () => {
      // Refetch to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
    },
  });
}

/**
 * Hook for syncing user with backend after Clerk authentication
 * Should be called once after successful login/signup
 */
export function useSyncUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: userAPI.UserSyncRequest) => {
      const response = await userAPI.syncUser(userData);

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to sync user");
      }

      return response.data!;
    },
    onSuccess: (data) => {
      // Update the user profile cache with synced data
      queryClient.setQueryData(queryKeys.user.profile(), data);
    },
    onError: (error) => {
      console.error("Failed to sync user:", error);
    },
  });
}

/**
 * Delete user account
 * Permanently deletes the user's account and all associated data
 */
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async (confirmEmail: string) => {
      const response = await userAPI.deleteAccount(confirmEmail);

      if (response.error || !response.success) {
        throw new Error(response.error || "Failed to delete account");
      }

      return response.data;
    },
    // Note: Don't clear queryClient here - the signOut() in the component
    // will handle session cleanup and prevent token refresh loops
  });
}

/**
 * Type exports
 */
export type { UserPreferences, UserResponse };
