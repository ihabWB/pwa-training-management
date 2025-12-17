import { createBrowserClient } from '@supabase/ssr';

/**
 * Check if the current session is valid and refresh if needed
 * Returns true if session is valid, false if expired and needs re-login
 */
export async function checkAndRefreshSession(): Promise<boolean> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // Try to refresh the session
    const { data, error } = await supabase.auth.refreshSession();
    
    if (error || !data.session) {
      // Session expired and cannot be refreshed
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Session refresh error:', error);
    return false;
  }
}

/**
 * Handle session expired error by redirecting to login
 */
export function handleSessionExpired(locale: string = 'ar') {
  // Clear local storage
  localStorage.removeItem('sb-access-token');
  localStorage.removeItem('sb-refresh-token');
  
  // Redirect to login with return URL
  const currentPath = window.location.pathname;
  window.location.href = `/${locale}/login?redirectTo=${encodeURIComponent(currentPath)}`;
}

/**
 * Check if error is a JWT expired error
 */
export function isJWTExpiredError(error: any): boolean {
  if (!error) return false;
  
  const errorMessage = error.message?.toLowerCase() || '';
  const errorCode = error.code?.toLowerCase() || '';
  
  return (
    errorMessage.includes('jwt') && errorMessage.includes('expired') ||
    errorCode === 'jwt_expired' ||
    errorCode === 'pgrst301'
  );
}

/**
 * Wrapper function to handle API calls with automatic session refresh
 */
export async function withSessionRefresh<T>(
  apiCall: () => Promise<T>,
  locale: string = 'ar'
): Promise<T> {
  try {
    return await apiCall();
  } catch (error: any) {
    // Check if it's a JWT expired error
    if (isJWTExpiredError(error)) {
      // Try to refresh session
      const refreshed = await checkAndRefreshSession();
      
      if (refreshed) {
        // Retry the API call
        return await apiCall();
      } else {
        // Session cannot be refreshed, redirect to login
        handleSessionExpired(locale);
        throw new Error('Session expired');
      }
    }
    
    // If not a JWT error, throw it
    throw error;
  }
}
