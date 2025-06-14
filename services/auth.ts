// services/api/auth.ts
import { api } from '../utils/api';
import type { ApiResponse } from '@/utils/api-types';
import type { User } from '@/types/database';

// Extended auth user type (combines database User with Supabase auth fields)
export interface AuthUser extends User {
  email_confirmed_at?: string;
  created_at?: string;
  updated_at?: string;
  user_metadata?: {
    name?: string;
    full_name?: string;
    avatar_url?: string;
    [key: string]: any;
  };
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface AuthResponse {
  user: AuthUser;
  session: {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    user: AuthUser;
  };
}

// Request payload types
export interface SignUpRequest {
  email: string;
  password: string;
  name?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export const authApiClientMethods = {
  // Set authentication tokens
  setTokens: (accessToken: string, refreshToken?: string) => {
    api.setToken(accessToken);
    // Store refresh token separately if needed
  },

  // Clear authentication tokens
  clearTokens: () => {
    api.clearToken();
  },

  // POST /api/auth/signup - Register new user
  signUp: (data: SignUpRequest) => 
    api.post<ApiResponse<AuthResponse>>('/auth/signup', data),

  // POST /api/auth/signin - Sign in user
  signIn: (data: SignInRequest) => 
    api.post<ApiResponse<AuthResponse>>('/auth/signin', data),

  // POST /api/auth/signout - Sign out user (requires auth)
  signOut: () => 
    api.authPost<ApiResponse<{ message: string }>>('/auth/signout', {}),

  // GET /api/auth/me - Get current user (requires auth)
  getCurrentUser: () => 
    api.authGet<ApiResponse<{ user: AuthUser }>>('/auth/me'),

  // POST /api/auth/reset-password - Reset password
  resetPassword: (data: ResetPasswordRequest) => 
    api.post<ApiResponse<{ message: string }>>('/auth/reset-password', data),

  // PUT /api/auth/profile - Update user profile (requires auth)
  updateProfile: (data: UpdateProfileRequest) => 
    api.authPut<ApiResponse<{ user: AuthUser }>>('/auth/profile', data),

  // POST /api/auth/refresh - Refresh session
  refreshToken: (data: RefreshTokenRequest) => 
    api.post<ApiResponse<AuthTokens>>('/auth/refresh', data),

  // Utility methods for token management
  getStoredTokens: () => {
    // Note: In Claude.ai artifacts, localStorage is not available
    // In a real app, you would use AsyncStorage (React Native) or localStorage (web)
    // For now, returning null - implement based on your platform
    return {
      accessToken: api.getToken(),
      refreshToken: null as string | null, // You'll need to store this separately
    };
  },

  storeTokens: (accessToken: string, refreshToken: string) => {
    // Note: In Claude.ai artifacts, localStorage is not available
    // In a real app, you would store in AsyncStorage (React Native) or localStorage (web)
    api.setToken(accessToken);
    console.log('Tokens stored (implement persistent storage based on your platform)');
  },

  removeTokens: () => {
    // Note: In Claude.ai artifacts, localStorage is not available
    // In a real app, you would remove from AsyncStorage (React Native) or localStorage (web)
    api.clearToken();
    console.log('Tokens removed (implement persistent storage based on your platform)');
  },

  // Initialize auth client with stored tokens
  initializeAuth: async () => {
    const { accessToken, refreshToken } = authApiClientMethods.getStoredTokens();
    
    if (accessToken) {
      api.setToken(accessToken);
      
      try {
        // Verify token is still valid
        await authApiClientMethods.getCurrentUser();
        return true;
      } catch (error) {
        // Token invalid, try to refresh if we have refresh token
        if (refreshToken) {
          try {
            const response = await authApiClientMethods.refreshToken({ refresh_token: refreshToken });
            if (response.success && response.data) {
              authApiClientMethods.storeTokens(response.data.access_token, response.data.refresh_token);
              return true;
            }
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
          }
        }
        
        // Clear invalid tokens
        authApiClientMethods.removeTokens();
        return false;
      }
    }
    
    return false;
  },
};