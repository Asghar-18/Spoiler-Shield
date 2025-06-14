// services/api/titles.ts
import type { InsertTitle, Title } from '@/types/database';
import type { ApiResponse } from '@/utils/api-types';
import { api } from '../utils/api';

// Define the API response wrapper type


export const titlesApiClient = {
  getTitles: () => api.get<ApiResponse<Title[]>>('/titles'),
  getTitleById: (id: string) => api.get<ApiResponse<Title>>(`/titles/${id}`),
  createTitle: (title: InsertTitle) => api.post<ApiResponse<Title>>('/titles', title),
  updateTitle: (id: string, updates: Partial<Title>) => api.put<ApiResponse<Title>>(`/titles/${id}`, updates),
  deleteTitle: (id: string) => api.delete(`/titles/${id}`), // Note: removed duplicate /api
  searchTitles: (query: string) => api.get<ApiResponse<Title[]>>(`/titles/search?query=${encodeURIComponent(query)}`), // Note: removed duplicate /api
};