"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Cronograma } from "@/types/cronograma"
import { getCronogramas } from "@/utils/cronogramas"
import { CronogramaList } from "@/components/cronograma/CronogramaList"
import { Button } from "@/components/ui/button"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { Plus, Calendar } from "lucide-react"
import { PageHeader } from "@/components/PageHeader"

export default function AdminCronogramaPage() {
  const router = useRouter()
  const [cronogramas, setCronogramas] = useState<Cronograma[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    const data = await getCronogramas()
    setCronogramas(data)
    setIsLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <div className="p-6 space-y-6">
        <PageHeader
          title="Cronograma Anual"
          subtitle="Visualize e gerencie os eventos e datas importantes da escola."
          backHref="/admin/dashboard"
          actions={
            <Button
              onClick={() => router.push("/admin/cronograma/cadastrar")}
              variant="primary"
              className="flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Novo Evento
            </Button>
          }
        />

        <CronogramaList cronogramas={cronogramas} isLoading={isLoading} onRefresh={loadData} />
      </div>
    </RouteGuard>
  )
}
