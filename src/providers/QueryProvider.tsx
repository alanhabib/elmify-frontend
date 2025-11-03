/**
 * Query Provider with Toast Integration
 * Apple Podcasts-style error handling and user feedback
 */

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import { queryClient } from '@/queries/client';

interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Toast component must be last to appear on top */}
      <Toast />
    </QueryClientProvider>
  );
};