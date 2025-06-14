// services/api/progress.ts
import type { UserProgress } from '@/types/database';
import type { ApiResponse } from '@/utils/api-types';
import { api } from '../utils/api';

// Extended types to match your service (includes fields not in original schema)
export interface ExtendedUserProgress extends UserProgress {
  progress_percentage?: number;
  updated_at?: string;
  titles?: {
    id: string;
    name: string | null;
    coverImage: string | null;
  };
}

// Request payload types
export interface UpdateProgressRequest {
  title_id: string;
  current_chapter: number;
  total_chapters: number;
}

export interface UpdateProgressByTitleRequest {
  current_chapter: number;
  total_chapters: number;
}

// Progress statistics type
export interface ProgressStats {
  total_titles: number;
  completed_titles: number;
  in_progress_titles: number;
  average_progress: number;
  total_chapters_read: number;
}

export const progressApiClient = {
  // Get all user progress (authenticated user from token)
  getUserProgress: () => 
    api.authGet<ApiResponse<ExtendedUserProgress[]>>('/progress'),

  // Get user progress statistics
  getUserProgressStats: () => 
    api.authGet<ApiResponse<ProgressStats>>('/progress/stats'),

  // Get progress for a specific title
  getProgressByTitle: (titleId: string) => 
    api.authGet<ApiResponse<ExtendedUserProgress>>(`/progress/title/${titleId}`),

  // Update user progress (POST method)
  updateProgress: (data: UpdateProgressRequest) => 
    api.authPost<ApiResponse<ExtendedUserProgress>>('/progress', data),

  // Update progress for a specific title (PUT method - alternative endpoint)
  updateProgressByTitle: (titleId: string, data: UpdateProgressByTitleRequest) => 
    api.authPut<ApiResponse<ExtendedUserProgress>>(`/progress/title/${titleId}`, data),

  // Reset progress for a title
  resetProgress: (titleId: string) => 
    api.authPost<ApiResponse<ExtendedUserProgress>>(`/progress/title/${titleId}/reset`, {}),

  // Delete progress for a title
  deleteProgress: (titleId: string) => 
    api.authDelete(`/progress/title/${titleId}`),
};