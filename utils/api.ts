// utils/api.ts

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL!;


// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

const defaultHeaders: Record<string, string> = {
  'Content-Type': 'application/json',
};

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { ...defaultHeaders };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
};

// Enhanced error handling
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // If we can't parse JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }
    
    throw new ApiError(errorMessage, response.status, response);
  }

  // Handle no-content responses
  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return await response.json();
  } catch (error) {
    console.error('Failed to parse JSON response:', error);
    throw new ApiError('Invalid JSON response', response.status, response);
  }
};

export const api = {
  // Token management methods
  setTokens: (access: string, refresh?: string) => {
    accessToken = access;
    if (refresh) {
      refreshToken = refresh;
    }
  },

  clearTokens: () => {
    accessToken = null;
    refreshToken = null;
  },

  getTokens: () => ({
    accessToken,
    refreshToken,
  }),

  // Backward compatibility
  setToken: (token: string) => {
    accessToken = token;
  },

  clearToken: () => {
    accessToken = null;
  },

  getToken: () => accessToken,

  // Original methods (no auth)
  get: async <T>(endpoint: string): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: defaultHeaders,
      });

      return await handleResponse<T>(response);
    } catch (error) {
      console.error('API GET Error:', error);
      throw error;
    }
  },

  post: async <T>(endpoint: string, data: any): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(data),
      });

      return await handleResponse<T>(response);
    } catch (error) {
      console.error('API POST Error:', error);
      throw error;
    }
  },

  put: async <T>(endpoint: string, data: any): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify(data),
      });

      return await handleResponse<T>(response);
    } catch (error) {
      console.error('API PUT Error:', error);
      throw error;
    }
  },

  delete: async <T = void>(endpoint: string): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: defaultHeaders,
      });

      return await handleResponse<T>(response);
    } catch (error) {
      console.error('API DELETE Error:', error);
      throw error;
    }
  },

  // Authenticated methods (include auth headers)
  authGet: async <T>(endpoint: string): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      return await handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        accessToken = null; // Clear invalid token
        throw new Error('Authentication required');
      }
      console.error('API AUTH GET Error:', error);
      throw error;
    }
  },

  authPost: async <T>(endpoint: string, data: any): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        accessToken = null; // Clear invalid token
        throw new Error('Authentication required');
      }
      console.error('API AUTH POST Error:', error);
      throw error;
    }
  },

  authPut: async <T>(endpoint: string, data: any): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });

      return await handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        accessToken = null; // Clear invalid token
        throw new Error('Authentication required');
      }
      console.error('API AUTH PUT Error:', error);
      throw error;
    }
  },

  authDelete: async <T = void>(endpoint: string): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      return await handleResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        accessToken = null; // Clear invalid token
        throw new Error('Authentication required');
      }
      console.error('API AUTH DELETE Error:', error);
      throw error;
    }
  },

  // Utility method to check if we have valid tokens
  hasValidTokens: () => {
    return !!accessToken;
  },

  // Method to handle automatic token refresh (if needed)
  withTokenRefresh: async <T>(apiCall: () => Promise<T>): Promise<T> => {
    try {
      return await apiCall();
    } catch (error) {
      if (error instanceof Error && error.message === 'Authentication required' && refreshToken) {
        // Attempt to refresh token and retry
        // This would need to be implemented based on your auth service
        console.log('Token refresh needed - implement refresh logic');
      }
      throw error;
    }
  },
};