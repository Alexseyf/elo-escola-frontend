"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast, Toaster } from "sonner";
import { useTenant } from "@/hooks/useTenant";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuthStore();

  useTenant();

  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam === 'tenant-mismatch') {
      toast.error('Acesso negado: você foi desconectado por segurança', {
        description: 'Tentativa de acesso a dados de outra escola detectada.',
      });
    } else if (errorParam === 'unauthorized') {
      toast.error('Sessão expirada', {
        description: 'Por favor, faça login novamente.',
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login({
        email,
        senha: password,
      });

      if (success) {
        toast("Login realizado com sucesso!", {
          description: "Sucesso!",
        });
        setTimeout(() => {
          const user = useAuthStore.getState().user;

          if (user?.roles?.includes("PLATFORM_ADMIN")) {
            router.push("/platform/escolas");
          } else if (user?.roles?.includes("ADMIN")) {
            router.push("/admin/dashboard");
          } else if (user?.roles?.includes("PROFESSOR")) {
            router.push("/professor/dashboard");
          } else if (user?.roles?.includes("RESPONSAVEL")) {
            router.push("/responsavel/dashboard");
          } else {
            router.push("/");
          }
        }, 2000);
      } else {
        const authError = useAuthStore.getState().error;
        setError(authError || "Erro ao fazer login");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor");
      console.error("Erro no login:", err);
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
              {isLoading ? "Entrando..." : "Entrar"}
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">Carregando...</div>
      </div>
    }>
      <LoginForm />
      <Toaster />
    </Suspense>
  );
}
