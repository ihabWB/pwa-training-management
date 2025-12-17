import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Check if the current session is valid and refresh if needed
 * Returns true if session is valid, false if expired
 */
export async function ensureValidSession(supabase: SupabaseClient): Promise<boolean> {
  try {
    // Try to get current user to verify session
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('User session invalid:', userError);
      
      // Try to refresh session
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !data.session) {
        console.error('Failed to refresh session:', refreshError);
        return false;
      }
      
      console.log('Session refreshed successfully after error');
      return true;
    }

    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.error('Session error:', sessionError);
      
      // Try to refresh
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !data.session) {
        return false;
      }
      
      return true;
    }

    // Check if session is close to expiring (within 10 minutes)
    const expiresAt = session.expires_at;
    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiresAt ? expiresAt - now : 0;
    
    // If less than 10 minutes until expiry or already expired, refresh the session
    if (timeUntilExpiry < 600) {
      console.log('Session expiring soon, refreshing...');
      const { data, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !data.session) {
        console.error('Failed to refresh session:', refreshError);
        return false;
      }
      
      console.log('Session refreshed successfully');
    }
    
    return true;
  } catch (error) {
    console.error('Error checking session:', error);
    return false;
  }
}

/**
 * Handle Supabase errors and check if they're auth-related
 */
export function isAuthError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toUpperCase() || '';
  
  return (
    errorMessage.includes('jwt') ||
    errorMessage.includes('expired') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('token') ||
    errorMessage.includes('refresh_token_not_found') ||
    errorCode === 'PGRST301' ||
    errorCode === '401' ||
    error.status === 401
  );
}

/**
 * Get user-friendly error message
 */
export function getAuthErrorMessage(locale: string): string {
  return locale === 'ar' 
    ? 'انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى' 
    : 'Session expired. Please login again';
}
