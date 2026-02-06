import config from '@/config';

interface ApiRequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const api = async (endpoint: string, options: ApiRequestOptions = {}): Promise<Response> => {
  const { useAuthStore } = await import('@/stores/useAuthStore');
  const { useTenantStore } = await import('@/stores/useTenantStore');

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

  /* 
    Login, recuperação de senha e validação de senha são rotas públicas e não exigem o cabeçalho x-tenant-id.
    Os endpoints do BNCC (campos, objetivos, grupos) também são acessíveis para PLATFORM_ADMIN sem contexto de tenant.

  */
  const isPublicEndpoint = endpoint.includes('/api/v1/login') || 
                          endpoint.includes('/api/v1/recupera-senha') || 
                          endpoint.includes('/api/v1/valida-senha');
  
  const isBNCCEndpoint = endpoint.includes('/api/v1/campos') ||
                        endpoint.includes('/api/v1/objetivos') ||
                        endpoint.includes('/api/v1/grupos');
  
  if (!isPublicEndpoint && !isBNCCEndpoint) {
    let finalTenantId = tenantSlug;

    // Em desenvolvimento, tenta recuperar do localStorage ou stores se não veio automática
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
       /* 
          1. Tenta localStorage (definido no login)
          2. Tenta useTenantStore (estado global)
          3. Tenta useAuthStore (dados do usuário logado)
       */
       const localSlug = localStorage.getItem('schoolSlug');
       
       if (localSlug) {
         finalTenantId = localSlug;
       } else if (!finalTenantId) {
         const user = useAuthStore.getState().user;
         if (user?.school?.slug) {
           finalTenantId = user.school.slug;
         }
       }
    }

    if (finalTenantId) {
      headers['x-tenant-id'] = finalTenantId;
    } else {
       console.warn('[API] Warning: x-tenant-id missing for authenticated request');
    }
  }

  const url = `${config.API_URL}${endpoint}`;



  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 1. Tratar Sessão Expirada ou Sem Permissão (401)
  if (response.status === 401 && !isPublicEndpoint) {
    const data = await response.clone().json().catch(() => ({}));
    
    if (typeof window !== 'undefined') {
      const { useAuthStore } = await import('@/stores/useAuthStore');
      
      // 1. Limpa o localStorage imediatamente (síncrono) para prevenir re-logins automáticos
      localStorage.clear();

      // 2. Define o caminho de redirecionamento
      const redirectPath = data.code === 'TOKEN_EXPIRED' 
        ? '/login?error=expired' 
        : '/login?error=unauthorized';
        
      // 3. Redireciona o navegador (força o recarregamento total da página)
      window.location.href = redirectPath;
      
      // 4. Retorna uma Promise que nunca resolve. 
      // Isso "congela" o componente atual e evita que ele tente processar dados nulos ou renderizar erros.
      return new Promise<Response>(() => {});
    }
  }

  /* 
    Relatórios de atividades podem retornar 403 se o usuário não tiver permissão (ex: professor acessando rota de admin).
    Nesse caso, não queremos deslogar, apenas falhar a requisição para que a UI trate o erro.
  */
  const isRelatorioEndpoint = endpoint.includes('/api/v1/atividades/relatorio');

  // Faça logout somente em caso de erro 403 para endpoints relacionados ao locatário onde a incompatibilidade de locatário é o problema.
  // Não faça logout para endpoints BNCC ou quando o usuário for PLATFORM_ADMIN sem locatário.
  if (response.status === 403 && !isBNCCEndpoint && !isPublicEndpoint && !isRelatorioEndpoint) {
    // Faça logout somente se tivermos um tenant-id mas ainda recebemos 403 (incompatibilidade de locatário real)
    if (headers['x-tenant-id']) {
      console.error('[API] 403 Forbidden - Tenant context mismatch detected');
      
      if (typeof window !== 'undefined') {
        const { useAuthStore } = await import('@/stores/useAuthStore');
        useAuthStore.getState().logout();
        
        window.location.href = '/login?error=tenant-mismatch';
      }
    }
  }

  return response;
};
