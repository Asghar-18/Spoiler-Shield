import { supabase } from '../lib/supabase';

export const progressService = {
  // Get user progress for a specific title
  getUserProgress: async (userId: string, titleId: string) => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('title_id', titleId)
      .single();
    return { data, error };
  },

  // Get all user progress for a user
  getAllUserProgress: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        *,
        titles(id, name, coverImage)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Update user progress
  updateUserProgress: async (userId: string, titleId: string, maxChapter: number) => {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert(
        {
          user_id: userId,
          title_id: titleId,
          max_chapter: maxChapter,
        },
        {
          onConflict: 'user_id,title_id',
        }
      )
      .select()
      .single();
    return { data, error };
  },

//   // Create initial progress record
//   createUserProgress: async (progress: InsertUserProgress) => {
//     const { data, error } = await supabase
//       .from('user_progress')
//       .insert(progress)
//       .select()
//       .single();
//     return { data, error };
//   },

  // Delete user progress for a title
  deleteUserProgress: async (userId: string, titleId: string) => {
    const { data, error } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', userId)
      .eq('title_id', titleId);
    return { data, error };
  },

  // Get progress statistics for a user
  getProgressStats: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_progress')
      .select('max_chapter, titles(name)')
      .eq('user_id', userId);
    
    if (error) return { data: null, error };
    
    const stats = {
      totalBooks: data?.length || 0,
      totalChaptersRead: data?.reduce((sum, progress) => sum + (progress.max_chapter || 0), 0) || 0,
      averageProgress: data?.length > 0 
        ? Math.round((data.reduce((sum, progress) => sum + (progress.max_chapter || 0), 0) / data.length) * 100) / 100
        : 0
    };
    
    return { data: stats, error: null };
  },
};