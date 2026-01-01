
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export const TENANT_SLUG = 'bullsandbearsfx';

/**
 * Returns consistent headers for all backend API requests.
 * Automatically includes the tenant slug and the auth token if available.
 */
export const getHeaders = (customToken?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Tenant-Slug': TENANT_SLUG,
  };
  
  const token = customToken || localStorage.getItem('auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};
