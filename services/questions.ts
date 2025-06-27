// services/api/questions.ts
import type { Question, QuestionWithTitle } from '@/types/database';
import type { ApiResponse } from '@/utils/api-types';
import { api } from '../utils/api';

// Request payload types
export interface CreateQuestionRequest {
  title_id: string;
  question_text: string;
  chapter_limit: number;
}

export interface UpdateAnswerRequest {
  answer_text: string;
}

export interface UpdateStatusRequest {
  status: 'pending' | 'answered' | 'failed';
}

// Query parameter types
export interface GetUserQuestionsParams {
  userId: string;
  titleId?: string;
}

export interface GetRecentQuestionsParams {
  days?: number;
}

export interface GetQuestionsByStatusParams {
  status: 'pending' | 'answered' | 'failed';
}

export const questionsApiClient = {
  // POST /api/questions - Create a new question (requires auth)
  createQuestion: (questionData: CreateQuestionRequest) => 
    api.authPost<ApiResponse<Question>>('/questions', questionData),

  // GET /api/questions/user/:userId - Get user's questions (requires auth)
  getUserQuestions: (userId: string, titleId?: string) => {
    const endpoint = titleId 
      ? `/questions/user/${userId}?title_id=${titleId}`
      : `/questions/user/${userId}`;
    return api.authGet<ApiResponse<QuestionWithTitle[]>>(endpoint);
  },

  // GET /api/questions/my - Get current user's questions (requires auth)
  getMyQuestions: (titleId?: string) => {
    const endpoint = titleId 
      ? `/questions/my?title_id=${titleId}`
      : '/questions/my';
    return api.authGet<ApiResponse<QuestionWithTitle[]>>(endpoint);
  },

  // GET /api/questions/status/:status - Get questions by status for current user (requires auth)
  getQuestionsByStatus: (status: 'pending' | 'answered' | 'failed') => 
    api.authGet<ApiResponse<QuestionWithTitle[]>>(`/questions/status/${status}`),

  // GET /api/questions/recent - Get recent questions for current user (requires auth)
  getRecentQuestions: (days?: number) => {
    const endpoint = days 
      ? `/questions/recent?days=${days}`
      : '/questions/recent';
    return api.authGet<ApiResponse<QuestionWithTitle[]>>(endpoint);
  },

  // GET /api/questions/title/:titleId - Get questions by title for current user (requires auth)
  getQuestionsByTitle: (titleId: string) => 
    api.authGet<ApiResponse<QuestionWithTitle[]>>(`/questions/title/${titleId}`),

  // GET /api/questions/:questionId - Get a single question (requires auth)
  getQuestionById: (questionId: string) => 
    api.authGet<ApiResponse<QuestionWithTitle>>(`/questions/${questionId}`),

  // PUT /api/questions/:questionId/answer - Update question with answer (requires auth)
  updateQuestionAnswer: (questionId: string, answerText: string) => 
    api.authPut<ApiResponse<Question>>(`/questions/${questionId}/answer`, { answer_text: answerText }),

  // PUT /api/questions/:questionId/status - Update question status (requires auth)
  updateQuestionStatus: (questionId: string, status: 'pending' | 'answered' | 'failed') => 
    api.authPut<ApiResponse<Question>>(`/questions/${questionId}/status`, { status }),

  // DELETE /api/questions/:questionId - Delete a question (requires auth)
  deleteQuestion: (questionId: string) => 
    api.authDelete<ApiResponse<void>>(`/questions/${questionId}`),

  // Utility methods for common operations

  // Get all pending questions for current user
  getPendingQuestions: () => 
    questionsApiClient.getQuestionsByStatus('pending'),

  // Get all answered questions for current user
  getAnsweredQuestions: () => 
    questionsApiClient.getQuestionsByStatus('answered'),

  // Get all failed questions for current user
  getFailedQuestions: () => 
    questionsApiClient.getQuestionsByStatus('failed'),

  // Get questions from last week
  getLastWeekQuestions: () => 
    questionsApiClient.getRecentQuestions(7),

  // Get questions from last month
  getLastMonthQuestions: () => 
    questionsApiClient.getRecentQuestions(30),

  // Check if user has pending questions for a specific title
  hasPendingQuestionsForTitle: async (titleId: string): Promise<boolean> => {
    try {
      const response = await questionsApiClient.getMyQuestions(titleId);
      if (response.success) {
        return response.data.some(question => question.status === 'pending');
      }
      return false;
    } catch {
      return false;
    }
  },

  // Get question statistics for current user
  getQuestionStats: async () => {
    try {
      const [pending, answered, failed] = await Promise.all([
        questionsApiClient.getPendingQuestions(),
        questionsApiClient.getAnsweredQuestions(),
        questionsApiClient.getFailedQuestions()
      ]);

      if (pending.success && answered.success && failed.success) {
        const total = pending.data.length + answered.data.length + failed.data.length;
        return {
          success: true,
          data: {
            total,
            pending: pending.data.length,
            answered: answered.data.length,
            failed: failed.data.length,
            answerRate: total > 0 ? Math.round((answered.data.length / total) * 100) : 0,
            pendingRate: total > 0 ? Math.round((pending.data.length / total) * 100) : 0,
            failureRate: total > 0 ? Math.round((failed.data.length / total) * 100) : 0
          }
        };
      }

      return {
        success: false,
        error: 'Failed to get question statistics'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Get questions grouped by title for current user
  getQuestionsGroupedByTitle: async () => {
    try {
      const response = await questionsApiClient.getMyQuestions();
      if (response.success) {
        const grouped = response.data.reduce((acc, question) => {
          const titleId = question.title_id;
          const titleName = question.titles?.name || 'Unknown Title';
          
          if (!acc[titleId]) {
            acc[titleId] = {
              titleId,
              titleName,
              coverImage: question.titles?.coverImage || undefined, // Fix: handle null properly
              questions: [],
              totalQuestions: 0,
              pendingCount: 0,
              answeredCount: 0,
              failedCount: 0
            };
          }
          
          acc[titleId].questions.push(question);
          acc[titleId].totalQuestions++;
          
          // Fix: handle null status properly
          const status = question.status || 'pending'; // Default to 'pending' if null
          switch (status) {
            case 'pending':
              acc[titleId].pendingCount++;
              break;
            case 'answered':
              acc[titleId].answeredCount++;
              break;
            case 'failed':
              acc[titleId].failedCount++;
              break;
          }
          
          return acc;
        }, {} as Record<string, {
          titleId: string;
          titleName: string;
          coverImage?: string;
          questions: QuestionWithTitle[];
          totalQuestions: number;
          pendingCount: number;
          answeredCount: number;
          failedCount: number;
        }>);

        return {
          success: true,
          data: Object.values(grouped)
        };
      }

      return {
        success: false,
        error: 'Failed to get questions grouped by title'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Bulk operations helper
  bulkCreateQuestions: async (questions: CreateQuestionRequest[]): Promise<ApiResponse<Question>[]> => {
    const results: ApiResponse<Question>[] = [];
    
    for (const question of questions) {
      try {
        const result = await questionsApiClient.createQuestion(question);
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

  // Delete multiple questions
  bulkDeleteQuestions: async (questionIds: string[]): Promise<ApiResponse<void>[]> => {
    const results: ApiResponse<void>[] = [];
    
    for (const questionId of questionIds) {
      try {
        const result = await questionsApiClient.deleteQuestion(questionId);
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

  // Mark question as answered with custom answer
  markAsAnswered: (questionId: string, answerText: string) => 
    questionsApiClient.updateQuestionAnswer(questionId, answerText),

  // Mark question as failed
  markAsFailed: (questionId: string) => 
    questionsApiClient.updateQuestionStatus(questionId, 'failed'),

  // Reset question to pending
  resetToPending: (questionId: string) => 
    questionsApiClient.updateQuestionStatus(questionId, 'pending'),

  // Search questions by text (client-side filtering)
  searchQuestions: async (searchTerm: string, titleId?: string) => {
    try {
      const response = titleId 
        ? await questionsApiClient.getMyQuestions(titleId)
        : await questionsApiClient.getMyQuestions();
      
      if (response.success) {
        const filtered = response.data.filter(question => {
          // Fix: handle null question_text properly
          const questionText = question.question_text || '';
          const answerText = question.answer_text || '';
          
          return questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 answerText.toLowerCase().includes(searchTerm.toLowerCase());
        });
        
        return {
          success: true,
          data: filtered
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Get question activity timeline
  getQuestionTimeline: async (days: number = 30) => {
    try {
      const response = await questionsApiClient.getRecentQuestions(days);
      if (response.success) {
        // Group questions by date
        const timeline = response.data.reduce((acc, question) => {
          const date = new Date(question.created_at).toDateString();
          if (!acc[date]) {
            acc[date] = {
              date,
              questions: [],
              total: 0,
              pending: 0,
              answered: 0,
              failed: 0
            };
          }
          
          acc[date].questions.push(question);
          acc[date].total++;
          
          // Fix: handle null status properly
          const status = question.status || 'pending';
          if (status === 'pending' || status === 'answered' || status === 'failed') {
            acc[date][status]++;
          }
          
          return acc;
        }, {} as Record<string, {
          date: string;
          questions: QuestionWithTitle[];
          total: number;
          pending: number;
          answered: number;
          failed: number;
        }>);

        return {
          success: true,
          data: Object.values(timeline).sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};