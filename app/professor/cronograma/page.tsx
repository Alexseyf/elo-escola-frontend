"use client"

import { useEffect, useState } from "react"
import { Cronograma } from "@/types/cronograma"
import { getCronogramas } from "@/utils/cronogramas"
import { CronogramaList } from "@/components/cronograma/CronogramaList"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { Calendar } from "lucide-react"

import { PageHeader } from '@/components/PageHeader';

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
      <div className="p-6 space-y-6">
        <PageHeader
          title="Cronograma Anual"
          subtitle="Fique por dentro das datas importantes e eventos escolares"
          backHref="/professor/dashboard"
        />

        <CronogramaList cronogramas={cronogramas} isLoading={isLoading} onRefresh={loadData} />
      </div>
    </RouteGuard>
  )
}
