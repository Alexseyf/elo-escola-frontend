"use client"

import { CronogramaForm } from "@/components/cronograma/CronogramaForm"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/PageHeader"

export default function CadastrarCronogramaPage() {
  const router = useRouter()

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Cadastrar Evento"
          subtitle="Adicione um novo evento ao cronograma."
          backHref="/admin/cronograma"
        />

        <CronogramaForm />
      </div>
    </RouteGuard>
  )
}
