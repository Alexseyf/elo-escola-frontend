"use client"

import { useAuthStore } from "@/stores/useAuthStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RouteGuard } from "@/components/auth/RouteGuard"

export default function AdminDashboard() {
  const user = useAuthStore((state) => state.user)

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Painel do Administrador</h1>
        <p className="mb-4">Bem-vindo, {user?.email}</p>
        
        {/* TODO: Adicionar conteúdo */}
      </div>
    </RouteGuard>
  )
}
