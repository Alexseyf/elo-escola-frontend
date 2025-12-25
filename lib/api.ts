import config from '@/config';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTenantStore } from '@/stores/useTenantStore';


interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const api = async (endpoint: string, options: ApiRequestOptions = {}) => {
  let tenantSlug = useTenantStore.getState().tenantSlug;

  if (!tenantSlug) {
    if (typeof window !== 'undefined') {
       const parts = window.location.hostname.split('.');
       if (parts.length >= 3 && parts[0] !== 'www') {
         tenantSlug = parts[0];
       }
    } else {
       try {
         const { headers } = await import('next/headers');
         const headersList = await headers();
         const host = headersList.get('host') || '';
         const parts = host.split('.');
         if (parts.length >= 3 && parts[0] !== 'www') {
           tenantSlug = parts[0];
         }
       } catch (error) {
         console.warn('Failed to extract tenant from headers in SSR context', error);
       }
    }
  }


  const token = useAuthStore.getState().token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const isLoginEndpoint = endpoint.includes('/api/v1/login');
  
  if (!isLoginEndpoint) {
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      const schoolSlug = localStorage.getItem('schoolSlug');
      if (schoolSlug) {
        headers['x-tenant-id'] = schoolSlug;
      }
    } else if (tenantSlug) {
      headers['x-tenant-id'] = tenantSlug;
    }
  }

  const url = `${config.API_URL}${endpoint}`;

  if (process.env.NODE_ENV === 'development') {
    console.log(`[API] ${options.method || 'GET'} ${url}`);
    console.log('[API] Headers:', {
      'Content-Type': headers['Content-Type'],
      'Authorization': token ? `Bearer ${token.substring(0, 20)}...` : 'NOT SET',
      'x-tenant-id': headers['x-tenant-id'] || (isLoginEndpoint ? 'OMITTED (login endpoint)' : 'NOT SET'),
    });
    console.log('[API] Tenant Slug from Store:', tenantSlug || 'NOT SET');
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 403) {
    console.error('[API] 403 Forbidden - Tenant context mismatch detected');
    
    if (typeof window !== 'undefined') {
      const { useAuthStore } = await import('@/stores/useAuthStore');
      useAuthStore.getState().logout();
      
      window.location.href = '/login?error=tenant-mismatch';
    }
  }

  return response;
};
