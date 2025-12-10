import { useAuthStore } from '@/stores/useAuthStore';

export function getAuthToken(): string | null {
  const state = useAuthStore.getState();
  return state.token;
}

export function handleAuthError(): void {
  const { logout } = useAuthStore.getState();
  logout();
}
