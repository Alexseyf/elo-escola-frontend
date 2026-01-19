"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Cronograma } from "@/types/cronograma"
import { getCronogramas } from "@/utils/cronogramas"
import { CronogramaList } from "@/components/cronograma/CronogramaList"
import { Button } from "@/components/ui/button"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { Plus, Calendar } from "lucide-react"

export default function AdminCronogramaPage() {
  const router = useRouter()
  const [cronogramas, setCronogramas] = useState<Cronograma[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const data = await getCronogramas()
      setCronogramas(data)
      setIsLoading(false)
    }

    loadData()
  }, [])

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              Cronograma Anual
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Visualize e gerencie os eventos e datas importantes da escola.
            </p>
          </div>
          <Button 
            onClick={() => router.push("/admin/cronograma/cadastrar")}
            variant="primary"
            className="flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Novo Evento
          </Button>
        </div>

        <CronogramaList cronogramas={cronogramas} isLoading={isLoading} />
      </div>
    </RouteGuard>
  )
}
