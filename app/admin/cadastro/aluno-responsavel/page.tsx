"use client";

import { RouteGuard } from "@/components/auth/RouteGuard";
import { PageHeader } from "@/components/PageHeader";
import { CadastroUnificadoForm } from "@/components/admin/cadastro/CadastroUnificadoForm";

export default function UnifiedRegistrationPage() {
  return (
    <RouteGuard allowedRoles={["ADMIN"]}>
      <div className="container mx-auto py-8 px-4 space-y-8">
        <PageHeader
          title="Cadastro de Aluno"
          subtitle="Cadastre um novo aluno e responsáveis"
          backHref="/admin/alunos"
        />
        <div className="max-w-4xl">
          <CadastroUnificadoForm />
        </div>
      </div>
    </RouteGuard>
  );
}
