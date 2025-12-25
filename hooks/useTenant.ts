import { useEffect } from 'react';
import { useTenantStore } from '@/stores/useTenantStore';

function initializeTenantFromHostname() {
  if (typeof window === 'undefined') return;
  
  const currentSlug = useTenantStore.getState().tenantSlug;
  
  if (currentSlug) return;
  
  const hostname = window.location.hostname;
  const parts = hostname.split('.');

  if (parts.length >= 3) {
    const subdomain = parts[0];
    if (subdomain !== 'www') {
      useTenantStore.getState().setTenantSlug(subdomain);
    }
  } 
}

export function useTenant() {
  initializeTenantFromHostname();
  
  useEffect(() => {
    initializeTenantFromHostname();
  }, []);
}
