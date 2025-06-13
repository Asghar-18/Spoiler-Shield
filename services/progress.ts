import { supabase } from '../lib/supabase';

export const progressService = {
  // Update user progress for a title
  updateProgress: async (
    userId: string,
    titleId: string,
    currentChapter: number,
    totalChapters: number
  ) => {
    const progressPercentage = totalChapters > 0 ? (currentChapter / totalChapters) * 100 : 0;
    
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        title_id: titleId,
        current_chapter: currentChapter,
        total_chapters: totalChapters,
        progress_percentage: progressPercentage,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,title_id'
      })
      .select()
      .single();
      
    return { data, error };
  },

  // Get user progress for a specific title
  getProgressByTitle: async (userId: string, titleId: string) => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('title_id', titleId)
      .single();
      
    return { data, error };
  },

  // Get all user progress
  getUserProgress: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        titles(id, name, coverImage)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
      
    return { data, error };
  },

  // Delete progress for a title
  deleteProgress: async (userId: string, titleId: string) => {
    const { data, error } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', userId)
      .eq('title_id', titleId);
      
    return { data, error };
  },
};