import { supabase } from '../lib/supabase';
import type { Title, InsertTitle } from '../types/database';

export const titlesService = {
  // Get all titles (books)
  getTitles: async () => {
    const { data, error } = await supabase
      .from('titles')
      .select('*')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  // Get a single title by ID
  getTitleById: async (titleId: string) => {
    const { data, error } = await supabase
      .from('titles')
      .select('*')
      .eq('id', titleId)
      .single();
    return { data, error };
  },

  // Create a new title (admin function)
  createTitle: async (title: InsertTitle) => {
    const { data, error } = await supabase
      .from('titles')
      .insert(title)
      .select()
      .single();
    return { data, error };
  },

  // Update a title (admin function)
  updateTitle: async (titleId: string, updates: Partial<Title>) => {
    const { data, error } = await supabase
      .from('titles')
      .update(updates)
      .eq('id', titleId)
      .select()
      .single();
    return { data, error };
  },

  // Delete a title (admin function)
  deleteTitle: async (titleId: string) => {
    const { data, error } = await supabase
      .from('titles')
      .delete()
      .eq('id', titleId);
    return { data, error };
  },

  // Search titles by name
  searchTitles: async (searchTerm: string) => {
    const { data, error } = await supabase
      .from('titles')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .order('created_at', { ascending: false });
    return { data, error };
  },
};