
/**
 * Base URL for the backend API.
 * Priority: Environment Variable > Production Vercel App > Localhost
 */
export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 
  'https://investment-platform-core.vercel.app'
).replace(/\/$/, '');

export const TENANT_SLUG = 'bullsandbearsfx';

/**
 * Returns consistent headers for all backend API requests.
 * Automatically includes auth token, user context, and tenant information.
 * 
 * Headers included:
 * - Authorization: Bearer token (if available)
 * - X-User-ID: Current user ID (from localStorage user_data)
 * - X-User-Tenant-ID: User's tenant ID (for multi-tenant support)
 * - X-User-Role: User's role (INVESTOR, TENANT_ADMIN, SUPER_ADMIN)
 * - X-Tenant-Slug: Platform tenant slug
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

  // Extract user context from localStorage for role-based API access
  try {
    const userDataRaw = localStorage.getItem('user_data');
    if (userDataRaw && userDataRaw !== 'undefined' && userDataRaw !== 'null') {
      const userData = JSON.parse(userDataRaw);
      if (userData.id) headers['X-User-ID'] = userData.id;
      if (userData.tenantId) headers['X-User-Tenant-ID'] = userData.tenantId;
      if (userData.role) headers['X-User-Role'] = userData.role;
    }
  } catch (e) {
    // If parsing fails, silently continue without user context headers
    console.warn('Could not parse user_data for headers:', e);
  }
  
  return headers;
};
