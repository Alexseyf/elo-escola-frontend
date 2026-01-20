"use client"

import { useState, useMemo } from "react"
import { Cronograma, TipoEvento } from "@/types/cronograma"
import { CronogramaCard } from "./CronogramaCard"
import { Input } from "@/components/ui/input"
import { CustomSelect } from "@/components/CustomSelect"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, FilterX } from "lucide-react"

interface CronogramaListProps {
  cronogramas: Cronograma[]
  isLoading?: boolean
  onRefresh?: () => void
}

const getNomeMes = (numeroMes: number): string => {
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]
  return meses[numeroMes - 1] || ""
}

export function CronogramaList({ cronogramas, isLoading, onRefresh }: CronogramaListProps) {
  const [filtro, setFiltro] = useState("")
  const [mesFiltro, setMesFiltro] = useState("")
  const [tipoFiltro, setTipoFiltro] = useState("")

  const cronogramasFiltrados = useMemo(() => {
    return cronogramas.filter((c) => {
      const matchTitulo = c.titulo.toLowerCase().includes(filtro.toLowerCase())
      const matchTipo = tipoFiltro === "" || c.tipoEvento === tipoFiltro

      let matchMes = true
      if (mesFiltro !== "") {
        const dataCronograma = new Date(c.data)
        const mesCronograma = dataCronograma.getUTCMonth() + 1
        matchMes = mesCronograma === parseInt(mesFiltro)
      }
      
      return matchTitulo && matchTipo && matchMes && c.isAtivo
    })
  }, [cronogramas, filtro, mesFiltro, tipoFiltro])

  const cronogramasPorMes = useMemo(() => {
    const grupos = cronogramasFiltrados.reduce((acc, cronograma) => {
      const data = new Date(cronograma.data)
      const mes = data.getUTCMonth() + 1
      const ano = data.getUTCFullYear()
      const chave = `${ano}-${mes}`
      
      if (!acc[chave]) {
        acc[chave] = { mes, ano, items: [] }
      }
      
      acc[chave].items.push(cronograma)
      return acc
    }, {} as Record<string, { mes: number; ano: number; items: Cronograma[] }>)

    return Object.values(grupos).sort((a, b) => {
      if (a.ano !== b.ano) return a.ano - b.ano
      return a.mes - b.mes
    })
  }, [cronogramasFiltrados])

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((j) => (
                <Skeleton key={j} className="h-48 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="pl-9"
          />
        </div>
        <CustomSelect
          id="mesFiltro"
          name="mesFiltro"
          value={mesFiltro}
          onChange={(e) => setMesFiltro(e.target.value)}
          options={[
            { value: "", label: "Todos os meses" },
            { value: "1", label: "Janeiro" },
            { value: "2", label: "Fevereiro" },
            { value: "3", label: "Março" },
            { value: "4", label: "Abril" },
            { value: "5", label: "Maio" },
            { value: "6", label: "Junho" },
            { value: "7", label: "Julho" },
            { value: "8", label: "Agosto" },
            { value: "9", label: "Setembro" },
            { value: "10", label: "Outubro" },
            { value: "11", label: "Novembro" },
            { value: "12", label: "Dezembro" }
          ]}
        />
        <CustomSelect
          id="tipoFiltro"
          name="tipoFiltro"
          value={tipoFiltro}
          onChange={(e) => setTipoFiltro(e.target.value)}
          options={[
            { value: "", label: "Todos os tipos" },
            { value: TipoEvento.REUNIAO, label: "Reunião" },
            { value: TipoEvento.FERIADO, label: "Feriado" },
            { value: TipoEvento.RECESSO, label: "Recesso" },
            { value: TipoEvento.EVENTO_ESCOLAR, label: "Evento Escolar" },
            { value: TipoEvento.ATIVIDADE_PEDAGOGICA, label: "Atividade Pedagógica" },
            { value: TipoEvento.OUTRO, label: "Outro" }
          ]}
        />
      </div>

      {cronogramasFiltrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed text-center px-4">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <FilterX className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Nenhum evento encontrado</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Ajuste seus filtros ou tente buscar por outro termo.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {cronogramasPorMes.map((grupo) => (
            <div key={`${grupo.ano}-${grupo.mes}`} className="space-y-4">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-gray-900 border-l-4 border-l-blue-600 pl-3">
                  {getNomeMes(grupo.mes)} {grupo.ano}
                </h2>
                <div className="h-px bg-gray-100 flex-1" />
                <span className="text-xs font-medium text-muted-foreground bg-gray-50 px-2 py-1 rounded">
                  {grupo.items.length} evento{grupo.items.length !== 1 ? "s" : ""}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {grupo.items.map((cronograma) => (
                  <CronogramaCard 
                    key={cronograma.id} 
                    cronograma={cronograma} 
                    onDelete={onRefresh}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
