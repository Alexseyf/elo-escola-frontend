"use client"

import { useAuthStore } from "@/stores/useAuthStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RouteGuard } from "@/components/auth/RouteGuard"

export default function ProfessorDashboard() {
  const user = useAuthStore((state) => state.user)

  return (
    <RouteGuard allowedRoles={['PROFESSOR']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Painel do Professor</h1>
        <p className="mb-4">Olá, professor(a) {user?.email}</p>
        
        {/* TODO: Adicionar conteúdo */}

      </div>
    </RouteGuard>
  )
}
