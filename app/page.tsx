"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { SplashScreen } from '@/components/ui/splash-screen';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth, _hasHydrated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(_hasHydrated);
  }, [_hasHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    const isAuth = checkAuth() || (isAuthenticated && !!user);

    if (isAuth && user?.roles) {
      if (user.roles.includes('PLATFORM_ADMIN')) {
        router.push('/platform/escolas');
      } else if (user.roles.includes('ADMIN')) {
        router.push('/admin/dashboard');
      } else if (user.roles.includes('PROFESSOR')) {
        router.push('/professor/dashboard');
      } else if (user.roles.includes('RESPONSAVEL')) {
        router.push('/responsavel/dashboard');
      } else {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [user, isAuthenticated, checkAuth, router, isHydrated]);

  return null;
}
