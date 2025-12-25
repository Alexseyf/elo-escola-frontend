'use client';

import { useTenantStore } from '@/stores/useTenantStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { useState, useEffect } from 'react';

export function TenantDebugger() {
  const tenantSlug = useTenantStore(state => state.tenantSlug);
  const user = useAuthStore(state => state.user);
  
  const [hostname, setHostname] = useState('Loading...');
  
  useEffect(() => {
    setHostname(window.location.hostname);
  }, []);
  
  if (process.env.NODE_ENV !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-yellow-100 p-4 rounded-lg border-2 border-yellow-500 shadow-lg z-50 max-w-xs">
      <h3 className="font-bold text-sm mb-2">🔍 Tenant Debug</h3>
      <div className="text-xs space-y-1">
        <p><strong>Slug:</strong> {tenantSlug || <span className="text-red-600">NOT SET</span>}</p>
        <p><strong>User:</strong> {user?.email || <span className="text-gray-400">NOT LOGGED IN</span>}</p>
        <p><strong>School:</strong> {user?.school?.slug || <span className="text-gray-400">N/A</span>}</p>
        <p><strong>Hostname:</strong> {hostname}</p>
      </div>
    </div>
  );
}
