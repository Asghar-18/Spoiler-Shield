// Export all API services for easy importing
export { authService } from './auth';
export { chaptersService } from './chapters';
export { progressService } from './progress';
export { questionsService } from './questions';
export { titlesService } from './titles';

// Re-export supabase client for direct access when needed
export { supabase } from '../lib/supabase';

// Re-export types
export type * from '../types/database';
