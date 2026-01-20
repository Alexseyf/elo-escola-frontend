"use client"

import { useEffect, useState } from "react"
import { Cronograma } from "@/types/cronograma"
import { getCronogramas } from "@/utils/cronogramas"
import { CronogramaList } from "@/components/cronograma/CronogramaList"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { Calendar } from "lucide-react"

export default function ProfessorCronogramaPage() {
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
    <RouteGuard allowedRoles={['PROFESSOR']}>
      <div className="p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            Cronograma Anual
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fique por dentro das datas importantes e eventos escolares.
          </p>
        </div>

        <CronogramaList cronogramas={cronogramas} isLoading={isLoading} onRefresh={loadData} />
      </div>
    </RouteGuard>
  )
}
