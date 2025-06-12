import { supabase } from '../lib/supabase';

export const authService = {
  // Sign up new user
  signUp: async (email: string, password: string, name?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            full_name: name, // Some systems use full_name
          },
        },
      });
      return { data, error };
    } catch (error) {
      console.error('SignUp service error:', error);
      return { data: null, error };
    }
  },

  // Sign in user
  signIn: async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      console.error('SignIn service error:', error);
      return { data: null, error };
    }
  },

  // Sign out user
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error('SignOut service error:', error);
      return { error };
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { user, error };
    } catch (error) {
      console.error('GetCurrentUser service error:', error);
      return { user: null, error };
    }
  },

  // Get current session
  getCurrentSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      return { session, error };
    } catch (error) {
      console.error('GetCurrentSession service error:', error);
      return { session: null, error };
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    try {
      return supabase.auth.onAuthStateChange(callback);
    } catch (error) {
      console.error('OnAuthStateChange service error:', error);
      // Return a mock subscription object to prevent crashes
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    }
  },

  // Reset password
  resetPassword: async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'your-app://reset-password', // Update this to your app's deep link
      });
      return { data, error };
    } catch (error) {
      console.error('ResetPassword service error:', error);
      return { data: null, error };
    }
  },

  // Update user profile
  updateProfile: async (updates: { name?: string; email?: string }) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        email: updates.email,
        data: {
          name: updates.name,
          full_name: updates.name,
        },
      });
      return { data, error };
    } catch (error) {
      console.error('UpdateProfile service error:', error);
      return { data: null, error };
    }
  },

  // Additional utility methods
  
  // Check if user email is verified
  isEmailVerified: (user: any) => {
    return user?.email_confirmed_at != null;
  },

  // Get user metadata
  getUserMetadata: (user: any) => {
    return {
      name: user?.user_metadata?.name || user?.user_metadata?.full_name,
      avatar_url: user?.user_metadata?.avatar_url,
      ...user?.user_metadata,
    };
  },

  // Refresh session
  refreshSession: async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      return { data, error };
    } catch (error) {
      console.error('RefreshSession service error:', error);
      return { data: null, error };
    }
  },
};