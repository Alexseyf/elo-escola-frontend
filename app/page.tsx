"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';

export default function Home() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    const isAuth = checkAuth() || (isAuthenticated && !!user);

    if (isAuth && user?.roles) {
      if (user.roles.includes('ADMIN')) {
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
  }, [user, isAuthenticated, checkAuth, router]);

  return null;
}
