// Export all API services for easy importing
export { authApiClientMethods } from './auth';
export { chaptersApiClient } from './chapters';
export { progressApiClient } from './progress';
export { questionsService } from './questions';
export { titlesApiClient } from './titles';

// Re-export supabase client for direct access when needed
export { supabase } from '../lib/supabase';

// Re-export types
export type * from '../types/database';
