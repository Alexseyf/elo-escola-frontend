'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/stores/useAuthStore';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login({
        email,
        senha: password
      });

      if (success) {
        console.log('Login realizado com sucesso!');
        // Get user from store to check roles immediately? 
        // Note: getState() is available on the store object if imported as store, but here we use hook.
        // However, we just updated the store. useAuthStore.getState() is safe way to get fresh state.
        
        const user = useAuthStore.getState().user;
        
        if (user?.roles?.includes('ADMIN')) {
          router.push('/admin/dashboard');
        } else if (user?.roles?.includes('PROFESSOR')) {
          router.push('/professor/dashboard');
        } else if (user?.roles?.includes('RESPONSAVEL')) {
          router.push('/responsavel/dashboard');
        } else {
          router.push('/');
        }
      } else {
        const authError = useAuthStore.getState().error;
        setError(authError || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      console.error('Erro no login:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-neutral-200 to-neutral-300">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src="/logo.png" alt="Logo" className="h-20 w-auto" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Bem-vindo</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>

            <Link
              href="/forgot-password"
              className="text-xs text-blue-600 hover:text-blue-700 underline block text-center"
            >
              Esqueceu a senha?
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
