/**
 * User Query Hooks
 *
 * TanStack Query hooks for user profile and preferences
 * All hooks require authentication
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
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
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
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
        queryClient.setQueryData<UserResponse>(
          queryKeys.user.profile(),
          {
            ...previousUser,
            preferences: newPreferences,
          }
        );
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
 * Type exports
 */
export type { UserPreferences, UserResponse };
