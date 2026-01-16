"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast, Toaster } from "sonner";
import { api } from "@/lib/api";
import { Eye, EyeOff, Lock, AlertTriangle } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { user, token, tempPassword, logout } = useAuthStore();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const requirements = [
    { label: "Mínimo de 8 caracteres", test: (p: string) => p.length >= 8 },
    { label: "Uma letra maiúscula", test: (p: string) => /[A-Z]/.test(p) },
    { label: "Uma letra minúscula", test: (p: string) => /[a-z]/.test(p) },
    { label: "Um número", test: (p: string) => /[0-9]/.test(p) },
    { label: "Um símbolo (!@#$%^&*)", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
  ];

  if (!token) {
     if (typeof window !== 'undefined') router.push("/login");
  } else if (!tempPassword && user?.primeiroAcesso) {
     if (typeof window !== 'undefined') {
        toast.error("Sessão expirada. Faça login novamente.");
        logout();
     }
  }

  const isPasswordValid = requirements.every((req) => req.test(newPassword));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!isPasswordValid) {
      toast.error("A senha não atende a todos os requisitos.");
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não conferem.");
      setIsLoading(false);
      return;
    }

    if (!tempPassword) {
       toast.error("Erro de sessão. Faça login novamente.");
       logout();
       return;
    }

    try {
      const response = await api("/api/v1/alterar-senha", {
        method: "POST",
        body: JSON.stringify({
          userId: user?.id,
          senhaAtual: tempPassword,
          novaSenha: newPassword,
        }),
      });

      if (response.ok) {
        toast.success("Senha alterada com sucesso!");
        
        useAuthStore.setState((state) => ({
            ...state,
            user: state.user ? { ...state.user, primeiroAcesso: false } : null,
            tempPassword: undefined
        }));

        setTimeout(() => {
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
        const data = await response.json();
        toast.error(data.erro || data.message || "Erro ao alterar a senha.");
      }
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast.error("Ocorreu um erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-neutral-200 to-neutral-300 px-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-yellow-500">
        <CardHeader className="space-y-4 text-center">
            <div className="mx-auto bg-yellow-100 p-3 rounded-full w-fit">
                <Lock className="h-8 w-8 text-yellow-600" />
            </div>
           <div className="space-y-2">
            <CardTitle className="text-2xl">Crie sua nova senha</CardTitle>
            <CardDescription>
              Para garantir sua segurança, defina uma nova senha forte para acessar o sistema.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Password Checklist */}
            <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 space-y-2">
                <p className="text-sm font-medium text-neutral-700 mb-2">Requisitos da senha:</p>
                <div className="grid grid-cols-1 gap-1">
                    {requirements.map((req, index) => {
                        const met = req.test(newPassword);
                        return (
                            <div key={index} className="flex items-center space-x-2">
                                <div className={`h-4 w-4 rounded-full flex items-center justify-center border ${met ? 'bg-green-500 border-green-500' : 'border-neutral-300'}`}>
                                    {met && <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                </div>
                                <span className={`text-xs ${met ? 'text-green-700 font-medium' : 'text-neutral-500'}`}>{req.label}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Digite sua nova senha"
                  className={isPasswordValid && newPassword ? "border-green-500 focus-visible:ring-green-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Digite a senha novamente"
                  className={confirmPassword && confirmPassword === newPassword ? "border-green-500 focus-visible:ring-green-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={isLoading || !isPasswordValid || newPassword !== confirmPassword}
            >
              {isLoading ? "Salvando..." : "Alterar Senha e Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
