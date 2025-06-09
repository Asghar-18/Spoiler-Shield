import { supabase } from '../lib/supabase';
import type { Chapter, InsertChapter } from '../types/database';

export const chaptersService = {
  // Get all chapters for a specific title
  getChaptersByTitle: async (titleId: string) => {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('title_id', titleId)
      .order('order', { ascending: true });
    return { data, error };
  },

  // Get a single chapter by ID
  getChapterById: async (chapterId: string) => {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single();
    return { data, error };
  },

  // Get chapters up to a specific chapter number (for progress tracking)
  getChaptersUpTo: async (titleId: string, maxChapterOrder: number) => {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('title_id', titleId)
      .lte('order', maxChapterOrder)
      .order('order', { ascending: true });
    return { data, error };
  },

  // Get chapter by title and order number
  getChapterByOrder: async (titleId: string, chapterOrder: number) => {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('title_id', titleId)
      .eq('order', chapterOrder)
      .single();
    return { data, error };
  },

  // Get chapter count for a title
  getChapterCount: async (titleId: string) => {
    const { count, error } = await supabase
      .from('chapters')
      .select('*', { count: 'exact', head: true })
      .eq('title_id', titleId);
    return { count, error };
  },

  // Create a new chapter (admin function)
  createChapter: async (chapter: InsertChapter) => {
    const { data, error } = await supabase
      .from('chapters')
      .insert(chapter)
      .select()
      .single();
    return { data, error };
  },

  // Update a chapter (admin function)
  updateChapter: async (chapterId: string, updates: Partial<Chapter>) => {
    const { data, error } = await supabase
      .from('chapters')
      .update(updates)
      .eq('id', chapterId)
      .select()
      .single();
    return { data, error };
  },

  // Search chapters by name within a title
  searchChapters: async (titleId: string, searchTerm: string) => {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('title_id', titleId)
      .ilike('name', `%${searchTerm}%`)
      .order('order', { ascending: true });
    return { data, error };
  },
};