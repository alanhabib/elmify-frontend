// TODO: UNCOMMENT TO RE-ENABLE CLERK AUTH
// import { useAuth } from '@clerk/clerk-expo';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const useSupabase = () => {
  // TODO: UNCOMMENT TO RE-ENABLE CLERK AUTH
  // const { getToken } = useAuth();

  return createClient(supabaseUrl, supabaseAnonKey, {
    // TODO: UNCOMMENT TO RE-ENABLE CLERK AUTH
    // accessToken: async () => getToken() ?? null,
  });
};
