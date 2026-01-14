"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast, Toaster } from "sonner";
import { recuperaSenha, validaSenha } from "@/utils/password-recovery";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // SEND EMAIL
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await recuperaSenha(email);
      if (result.success) {
        toast.success("Código enviado para seu email!");
        setStep(2);
      } else {
        toast.error(result.message || "Erro ao enviar código.");
      }
    } catch {
      toast.error("Ocorreu um erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  // VALIDATE CODE & RESET PASSWORD
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    if (password.length < 6) {
       toast.error("A senha deve ter no mínimo 6 caracteres");
       return;
    }

    setIsLoading(true);

    try {
      const result = await validaSenha(email, code, password);
      if (result.success) {
        toast.success("Senha alterada com sucesso!");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        toast.error(result.message || "Erro ao redefinir senha.");
      }
    } catch {
      toast.error("Ocorreu um erro inesperado.");
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
            <CardTitle className="text-2xl">
              {step === 1 ? "Recuperar Senha" : "Redefinir Senha"}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? "Digite seu email para receber um código de recuperação"
                : "Digite o código enviado para seu email e a nova senha"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 ? (
            <form onSubmit={handleSendEmail} className="space-y-4">
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
              <Button type="submit" className="w-full" disabled={isLoading} variant="primary">
                {isLoading ? "Enviando..." : "Enviar Código"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
               <div className="space-y-2">
                <Label>Email</Label>
                <div className="p-2 bg-gray-100 rounded text-sm text-gray-600">{email}</div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Código de Verificação (4 dígitos)</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Ex: 1234"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  required
                  disabled={isLoading}
                  maxLength={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading} variant="primary">
                {isLoading ? "Salvando..." : "Alterar Senha"}
              </Button>
            </form>
          )}

          <div className="text-center mt-4">
            <Link
              href="/login"
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Voltar para o Login
            </Link>
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
}
