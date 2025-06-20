// services/api/chapters.ts
import type { Chapter } from '@/types/database';
import type { ApiResponse } from '@/utils/api-types';
import { api } from '../utils/api';

// Extended types to match your service responses
export interface ChapterWithCount {
  count: number;
}

// Request payload types
export interface CreateChapterRequest {
  title_id: string;
  order: number;
  name: string;
  content?: string | null;
}

export interface UpdateChapterRequest {
  order?: number;
  name?: string;
  content?: string | null;
}

// Search parameters
export interface SearchChaptersParams {
  titleId: string;
  searchTerm: string;
}

export const chaptersApiClient = {
  // GET /api/chapters/title/:titleId - Get all chapters for a title
  getChaptersByTitle: (titleId: string) => 
    api.get<ApiResponse<Chapter[]>>(`/chapters/title/${titleId}`),

  // GET /api/chapters/:chapterId - Get a single chapter
  getChapterById: (chapterId: string) => 
    api.get<ApiResponse<Chapter>>(`/chapters/${chapterId}`),

  // GET /api/chapters/title/:titleId/up-to/:order - Get chapters up to specific order (requires auth)
  getChaptersUpTo: (titleId: string, maxOrder: number) => 
    api.authGet<ApiResponse<Chapter[]>>(`/chapters/title/${titleId}/up-to/${maxOrder}`),

  // GET /api/chapters/title/:titleId/order/:order - Get chapter by order
  getChapterByOrder: (titleId: string, order: number) => 
    api.get<ApiResponse<Chapter>>(`/chapters/title/${titleId}/order/${order}`),

  // GET /api/chapters/title/:titleId/count - Get chapter count for a title
  getChapterCount: (titleId: string) => 
    api.get<ApiResponse<ChapterWithCount>>(`/chapters/title/${titleId}/count`),

  // GET /api/chapters/title/:titleId/search - Search chapters
  searchChapters: (titleId: string, searchTerm: string) => 
    api.get<ApiResponse<Chapter[]>>(`/chapters/title/${titleId}/search?q=${encodeURIComponent(searchTerm)}`),

  // POST /api/chapters - Create a new chapter (admin only, requires auth)
  createChapter: (chapter: CreateChapterRequest) => 
    api.authPost<ApiResponse<Chapter>>('/chapters', chapter),

  // PUT /api/chapters/:chapterId - Update a chapter (admin only, requires auth)
  updateChapter: (chapterId: string, updates: UpdateChapterRequest) => 
    api.authPut<ApiResponse<Chapter>>(`/chapters/${chapterId}`, updates),

  // Utility methods for common operations
  
  // Get the next chapter in sequence
  getNextChapter: async (titleId: string, currentOrder: number) => {
    return chaptersApiClient.getChapterByOrder(titleId, currentOrder + 1);
  },

  // Get the previous chapter in sequence
  getPreviousChapter: async (titleId: string, currentOrder: number) => {
    if (currentOrder <= 1) {
      throw new Error('No previous chapter available');
    }
    return chaptersApiClient.getChapterByOrder(titleId, currentOrder - 1);
  },

  // Get first chapter of a title
  getFirstChapter: async (titleId: string) => {
    return chaptersApiClient.getChapterByOrder(titleId, 1);
  },

  // Get last chapter of a title
  getLastChapter: async (titleId: string) => {
    try {
      const countResponse = await chaptersApiClient.getChapterCount(titleId);
      if (countResponse.success && countResponse.data.count > 0) {
        return chaptersApiClient.getChapterByOrder(titleId, countResponse.data.count);
      }
      throw new Error('No chapters found for this title');
    } catch (error) {
      throw error;
    }
  },

  // Check if a chapter exists at a specific order
  chapterExists: async (titleId: string, order: number): Promise<boolean> => {
    try {
      const response = await chaptersApiClient.getChapterByOrder(titleId, order);
      return response.success;
    } catch {
      return false;
    }
  },

  // Get chapter range (useful for pagination)
  getChapterRange: async (titleId: string, startOrder: number, endOrder: number): Promise<Chapter[]> => {
    try {
      const allChapters = await chaptersApiClient.getChaptersByTitle(titleId);
      if (allChapters.success) {
        return allChapters.data.filter(
          chapter => chapter.order !== null && chapter.order >= startOrder && chapter.order <= endOrder
        );
      }
      return [];
    } catch {
      return [];
    }
  },

  // Bulk operations helper
  bulkCreateChapters: async (chapters: CreateChapterRequest[]): Promise<ApiResponse<Chapter>[]> => {
    const results: ApiResponse<Chapter>[] = [];
    
    for (const chapter of chapters) {
      try {
        const result = await chaptersApiClient.createChapter(chapter);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return results;
  },

  // Get reading progress helper (combines with user progress)
  getReadingContext: async (titleId: string, currentChapterOrder: number) => {
    try {
      const [currentChapter, totalCount, chaptersUpTo] = await Promise.all([
        chaptersApiClient.getChapterByOrder(titleId, currentChapterOrder),
        chaptersApiClient.getChapterCount(titleId),
        chaptersApiClient.getChaptersUpTo(titleId, currentChapterOrder)
      ]);

      if (currentChapter.success && totalCount.success && chaptersUpTo.success) {
        return {
          success: true,
          data: {
            currentChapter: currentChapter.data,
            totalChapters: totalCount.data.count,
            chaptersRead: chaptersUpTo.data.length,
            progressPercentage: Math.round((currentChapterOrder / totalCount.data.count) * 100),
            hasNext: currentChapterOrder < totalCount.data.count,
            hasPrevious: currentChapterOrder > 1
          }
        };
      }

      return {
        success: false,
        error: 'Failed to get reading context'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};