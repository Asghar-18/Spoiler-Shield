// utils/api.ts

const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api' // Development
  : 'https://your-production-domain.com/api'; // Production

// Token management
let accessToken: string | null = null;

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

export const api = {
  // Token management methods
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`GET ${endpoint} failed:`, errorText);
        throw new Error(`HTTP GET error! status: ${response.status}`);
      }

      return await response.json();
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`POST ${endpoint} failed:`, errorText);
        throw new Error(`HTTP POST error! status: ${response.status}`);
      }

      return await response.json();
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`PUT ${endpoint} failed:`, errorText);
        throw new Error(`HTTP PUT error! status: ${response.status}`);
      }

      return await response.json();
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`DELETE ${endpoint} failed:`, errorText);
        throw new Error(`HTTP DELETE error! status: ${response.status}`);
      }

      return response.status !== 204 ? await response.json() : (undefined as T);
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AUTH GET ${endpoint} failed:`, errorText);
        
        if (response.status === 401) {
          accessToken = null; // Clear invalid token
          throw new Error('Authentication required');
        }
        
        throw new Error(`HTTP GET error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AUTH POST ${endpoint} failed:`, errorText);
        
        if (response.status === 401) {
          accessToken = null; // Clear invalid token
          throw new Error('Authentication required');
        }
        
        throw new Error(`HTTP POST error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AUTH PUT ${endpoint} failed:`, errorText);
        
        if (response.status === 401) {
          accessToken = null; // Clear invalid token
          throw new Error('Authentication required');
        }
        
        throw new Error(`HTTP PUT error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`AUTH DELETE ${endpoint} failed:`, errorText);
        
        if (response.status === 401) {
          accessToken = null; // Clear invalid token
          throw new Error('Authentication required');
        }
        
        throw new Error(`HTTP DELETE error! status: ${response.status}`);
      }

      return response.status !== 204 ? await response.json() : (undefined as T);
    } catch (error) {
      console.error('API AUTH DELETE Error:', error);
      throw error;
    }
  },
};