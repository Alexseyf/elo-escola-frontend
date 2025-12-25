import { useAuthStore } from '@/stores/useAuthStore';
import { toast } from 'sonner';

export function useApiErrorHandler() {
  const { logout } = useAuthStore();

  const handleGlobalError = (response: Response) => {
    if (response.status === 403) {
      toast.error('Acesso negado: contexto de escola inválido');
      logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login?error=tenant-mismatch';
      }
    } else if (response.status === 401) {
      toast.error('Sessão expirada. Por favor, faça login novamente.');
      logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login?error=unauthorized';
      }
    }
  };

  return { handleGlobalError };
}
