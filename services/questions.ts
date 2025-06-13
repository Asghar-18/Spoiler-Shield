import { supabase } from '../lib/supabase';

export const questionsService = {
  // Create a new question
  createQuestion: async (
    userId: string,
    titleId: string,
    questionText: string,
    chapterLimit: number
  ) => {
    const { data, error } = await supabase
      .from('questions')
      .insert({
        user_id: userId,
        title_id: titleId,
        question_text: questionText,
        chapter_limit: chapterLimit,
        status: 'pending',
      })
      .select()
      .single();
    return { data, error };
  },

  // Get user's questions for a title
  getUserQuestions: async (userId: string, titleId?: string) => {
    let query = supabase
      .from('questions')
      .select(`
        *,
        titles(id, name, coverImage)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (titleId) {
      query = query.eq('title_id', titleId);
    }

    const { data, error } = await query;
    return { data, error };
  },

  // Get a single question by ID
  getQuestionById: async (questionId: string) => {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        titles(id, name, coverImage)
      `)
      .eq('id', questionId)
      .single();
    return { data, error };
  },

  // Update question with AI answer
  updateQuestionAnswer: async (questionId: string, answerText: string) => {
    const { data, error } = await supabase
      .from('questions')
      .update({
        answer_text: answerText,
        status: 'answered',
        updated_at: new Date().toISOString(),
      })
      .eq('id', questionId)
      .select()
      .single();
    return { data, error };
  },

  // Update question status
  updateQuestionStatus: async (questionId: string, status: 'pending' | 'answered' | 'failed') => {
    const { data, error } = await supabase
      .from('questions')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', questionId)
      .select()
      .single();
    return { data, error };
  },

  // Delete a question
  deleteQuestion: async (questionId: string) => {
    const { data, error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);
    return { data, error };
  },

  // Get questions by status
  getQuestionsByStatus: async (userId: string, status: 'pending' | 'answered' | 'failed') => {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        titles(id, name, coverImage)
      `)
      .eq('user_id', userId)
      .eq('status', status)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get recent questions (last 7 days)
  getRecentQuestions: async (userId: string, days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        titles(id, name, coverImage)
      `)
      .eq('user_id', userId)
      .gte('created_at', cutoffDate.toISOString())
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get questions by title ID
  getQuestionsByTitle: async (userId: string, titleId: string) => {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        titles(id, name, coverImage)
      `)
      .eq('user_id', userId)
      .eq('title_id', titleId)
      .order('created_at', { ascending: false });
    return { data, error };
  },
};