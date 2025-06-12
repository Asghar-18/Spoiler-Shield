import { create } from "zustand";
import { authService } from "../services/auth";

interface User {
  id: string;
  email?: string;
  name?: string;
  email_confirmed_at?: string;
  created_at?: string;
  updated_at?: string;
}

interface AuthState {
  user: User | null;
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

  // Internal actions
  setUser: (user: User | null) => void;
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

      // Wait for session to load
      const {
        session,
        error,
      } = await authService.getCurrentSession();

      if (error) {
        console.error("Error getting session:", error);
        set({ user: null, isLoading: false, isInitialized: true });
        return;
      }

      set({ user: session?.user ?? null });

      // Set up listener after initial load
      authService.onAuthStateChange((event, session) => {
        console.log("Auth state changed:", event, session?.user?.email);
        set({ user: session?.user ?? null });
      });

      set({ isLoading: false, isInitialized: true });
    } catch (error) {
      console.error("Error initializing auth:", error);
      set({ user: null, isLoading: false, isInitialized: true });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true });

      const { error } = await authService.signIn(email, password);

      if (error) {
        set({ isLoading: false });
        return { error };
      }

      // User will be set via onAuthStateChange listener
      set({ isLoading: false });
      return { error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      set({ isLoading: false });
      return { error };
    }
  },

  signUp: async (email: string, password: string, name?: string) => {
    try {
      set({ isLoading: true });

      const { error } = await authService.signUp(email, password, name);

      set({ isLoading: false });
      return { error };
    } catch (error) {
      console.error("Sign up error:", error);
      set({ isLoading: false });
      return { error };
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true });

      const { error } = await authService.signOut();

      if (error) {
        console.error("Sign out error:", error);
      }

      // User will be set to null via onAuthStateChange listener
      set({ isLoading: false });
    } catch (error) {
      console.error("Sign out error:", error);
      set({ isLoading: false });
    }
  },

  resetPassword: async (email: string) => {
    try {
      const { error } = await authService.resetPassword(email);
      return { error };
    } catch (error) {
      console.error("Reset password error:", error);
      return { error };
    }
  },

  updateProfile: async (updates: { name?: string; email?: string }) => {
    try {
      const { data, error } = await authService.updateProfile(updates);

      if (!error && data?.user) {
        set({ user: data.user });
      }

      return { error };
    } catch (error) {
      console.error("Update profile error:", error);
      return { error };
    }
  },

  // Internal actions
  setUser: (user: User | null) => set({ user }),
  setLoading: (isLoading: boolean) => set({ isLoading }),
  setInitialized: (isInitialized: boolean) => set({ isInitialized }),
}));
