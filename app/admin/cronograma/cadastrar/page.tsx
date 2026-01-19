"use client"

import { CronogramaForm } from "@/components/cronograma/CronogramaForm"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { ArrowLeft, CalendarPlus } from "lucide-react"

export default function CadastrarCronogramaPage() {
  const router = useRouter()

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <div className="p-4 md:p-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.back()}
            className="hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarPlus className="w-7 h-7 text-blue-600" />
              Cadastrar Evento
            </h1>
            <p className="text-sm text-muted-foreground">
              Adicione um novo evento ao cronograma anual da escola.
            </p>
          </div>
        </div>

        <CronogramaForm />
      </div>
    </RouteGuard>
  )
}
