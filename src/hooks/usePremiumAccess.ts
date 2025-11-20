import { useCurrentUser } from "@/queries/hooks/user";

/**
 * Hook to check premium access status
 * Use this to control access to premium speakers and lectures
 */
export function usePremiumAccess() {
  const { data: user, isLoading } = useCurrentUser();

  const isPremium = user?.isPremium ?? false;

  /**
   * Check if user can access specific content
   * @param content - Object with optional isPremium field
   * @returns true if user can access the content
   */
  const canAccess = (content: { isPremium?: boolean }) => {
    // If content is not premium, everyone can access
    if (!content.isPremium) return true;
    // If content is premium, only premium users can access
    return isPremium;
  };

  /**
   * Filter an array of items to only include accessible content
   * @param items - Array of items with optional isPremium field
   * @returns Filtered array containing only accessible items
   */
  const filterAccessible = <T extends { isPremium?: boolean }>(items: T[]): T[] => {
    if (isPremium) return items;
    return items.filter(item => !item.isPremium);
  };

  return {
    isPremium,
    isLoading,
    canAccess,
    filterAccessible,
  };
}
