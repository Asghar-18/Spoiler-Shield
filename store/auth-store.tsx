// stores/auth-store.tsx
import { create } from "zustand";
import { authApiClientMethods, type AuthUser } from "../services/auth";

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (
    email: string,
    password: string,
    name?: string
  ) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updateProfile: (updates: {
    name?: string;
    email?: string;
  }) => Promise<{ error: any }>;
  refreshSession: () => Promise<{ error: any }>;

  // Internal actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    try {
      set({ isLoading: true });

      // Try to initialize with stored tokens
      const tokenValid = await authApiClientMethods.initializeAuth();

      if (tokenValid) {
        // Get current user info
        const response = await authApiClientMethods.getCurrentUser();
        if (response.success) {
          set({ user: response.data.user });
        } else {
          // If getting user info fails, clear tokens
          authApiClientMethods.removeTokens();
        }
      }

      set({ isLoading: false, isInitialized: true });
    } catch (error) {
      if (__DEV__) {
        console.log("Auth initialization error:", JSON.stringify(error));
      }
      // Clear potentially invalid tokens on error
      authApiClientMethods.removeTokens();
      set({ user: null, isLoading: false, isInitialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true });

      const response = await authApiClientMethods.signIn({ email, password });

      if (!response.success) {
        set({ isLoading: false });
        return { error: response.error || "Sign in failed" };
      }

      // Store tokens and user
      const { session, user } = response.data;
      authApiClientMethods.storeTokens(
        session.access_token,
        session.refresh_token
      );
      authApiClientMethods.setTokens(
        session.access_token,
        session.refresh_token
      );

      set({ user, isLoading: false });
      return { error: null };
    } catch (error) {
      if (__DEV__) {
        console.log("Sign in error:", JSON.stringify(error));
      }

      set({ isLoading: false });
      return {
        error: error instanceof Error ? error.message : "Sign in failed",
      };
    }
  },

  signUp: async (email: string, password: string, name?: string) => {
    try {
      set({ isLoading: true });

      const response = await authApiClientMethods.signUp({
        email,
        password,
        name,
      });

      if (!response.success) {
        set({ isLoading: false });
        return { error: response.error || "Sign up failed" };
      }

      // Note: With email confirmation, user might not be immediately signed in
      // Check if we got session data
      if (response.data?.session) {
        const { session, user } = response.data;
        authApiClientMethods.storeTokens(
          session.access_token,
          session.refresh_token
        );
        authApiClientMethods.setTokens(
          session.access_token,
          session.refresh_token
        );

        set({ user });
      }

      set({ isLoading: false });
      return { error: null };
    } catch (error) {
      if (__DEV__) {
        console.log("Sign up error:", JSON.stringify(error));
      }
      set({ isLoading: false });
      return {
        error: error instanceof Error ? error.message : "Sign up failed",
      };
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });

      // Call API to invalidate session
      await authApiClientMethods.signOut();

      // Clear tokens and user state
      authApiClientMethods.removeTokens();
      set({ user: null, isLoading: false });
    } catch (error) {
      if (__DEV__) {
        console.log("Sign out error:", JSON.stringify(error));
      }
      // Even if API call fails, clear local state
      authApiClientMethods.removeTokens();
      set({ user: null, isLoading: false });
    }
  },

  resetPassword: async (email: string) => {
    try {
      const response = await authApiClientMethods.resetPassword({ email });

      if (!response.success) {
        return { error: response.error || "Password reset failed" };
      }

      return { error: null };
    } catch (error) {
      if (__DEV__) {
        console.log("Reset password error:", JSON.stringify(error));
      }
      return {
        error: error instanceof Error ? error.message : "Password reset failed",
      };
    }
  },

  updateProfile: async (updates: { name?: string; email?: string }) => {
    try {
      set({ isLoading: true });

      const response = await authApiClientMethods.updateProfile(updates);

      if (!response.success) {
        set({ isLoading: false });
        return { error: response.error || "Profile update failed" };
      }

      // Update user in state
      set({ user: response.data.user, isLoading: false });
      return { error: null };
    } catch (error) {
      console.error("Update profile error:", error);
      set({ isLoading: false });
      return {
        error: error instanceof Error ? error.message : "Profile update failed",
      };
    }
  },

  refreshSession: async () => {
    try {
      const { refreshToken } = authApiClientMethods.getStoredTokens();

      if (!refreshToken) {
        return { error: "No refresh token available" };
      }

      const response = await authApiClientMethods.refreshToken({
        refresh_token: refreshToken,
      });

      if (!response.success) {
        // Refresh failed, clear everything
        authApiClientMethods.removeTokens();
        set({ user: null });
        return { error: response.error || "Session refresh failed" };
      }

      // Store new tokens and update API client
      const { access_token, refresh_token } = response.data;
      authApiClientMethods.storeTokens(access_token, refresh_token);
      authApiClientMethods.setTokens(access_token, refresh_token);

      // Get updated user info
      const userResponse = await authApiClientMethods.getCurrentUser();
      if (userResponse.success) {
        set({ user: userResponse.data.user });
      }

      return { error: null };
    } catch (error) {
      console.error("Session refresh error:", error);
      authApiClientMethods.removeTokens();
      set({ user: null });
      return {
        error:
          error instanceof Error ? error.message : "Session refresh failed",
      };
    }
  },

  // Internal actions
  setUser: (user: AuthUser | null) => set({ user }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setInitialized: (isInitialized: boolean) => set({ isInitialized }),
}));

// Helper hook for auth status
export const useAuth = () => {
  const { user, isLoading, isInitialized } = useAuthStore();

  return {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    isEmailVerified: !!user?.email_confirmed_at,
  };
};

// Type definitions
export type ApiResponse<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };
