"use client";

import { RouteGuard } from "@/components/auth/RouteGuard";
import { CadastroUnificadoForm } from "@/components/admin/cadastro/CadastroUnificadoForm";

export default function UnifiedRegistrationPage() {
  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <div className="container mx-auto py-8 px-4 space-y-8">
        <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Cadastro de Aluno</h1>
            <p className="text-muted-foreground">
                Cadastre um novo aluno e responsáveis.
            </p>
        </div>
        <div className="max-w-4xl">
            <CadastroUnificadoForm />
        </div>
      </div>
    </RouteGuard>
  );
}
