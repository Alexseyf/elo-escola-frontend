"use client"

import { Cronograma, TipoEvento } from "@/types/cronograma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, User } from "lucide-react"

interface CronogramaCardProps {
  cronograma: Cronograma
}

const formatarData = (dataString: string) => {
  const data = new Date(dataString)
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  })
}

const formatarIntervalo = (inicio: string, fim?: string | null) => {
  if (!fim || inicio.split('T')[0] === fim.split('T')[0]) {
    return formatarData(inicio)
  }
  
  // Se for o mesmo ano e mês, simplifica: 16 - 20 de Fevereiro de 2026
  // No momento, vamos manter o simples: DD/MM/AAAA - DD/MM/AAAA
  return `${formatarData(inicio)} - ${formatarData(fim)}`
}

const formatarTipoEvento = (tipo: TipoEvento) => {
  const tipos: Record<TipoEvento, string> = {
    [TipoEvento.REUNIAO]: "Reunião",
    [TipoEvento.FERIADO]: "Feriado",
    [TipoEvento.RECESSO]: "Recesso",
    [TipoEvento.EVENTO_ESCOLAR]: "Evento Escolar",
    [TipoEvento.ATIVIDADE_PEDAGOGICA]: "Atividade Pedagógica",
    [TipoEvento.OUTRO]: "Outro",
  }
  return tipos[tipo] || tipo
}

const getCorTipo = (tipo: TipoEvento) => {
  const cores: Record<TipoEvento, string> = {
    [TipoEvento.REUNIAO]: "bg-blue-100 text-blue-800 border-blue-200",
    [TipoEvento.FERIADO]: "bg-red-100 text-red-800 border-red-200",
    [TipoEvento.RECESSO]: "bg-yellow-100 text-yellow-800 border-yellow-200",
    [TipoEvento.EVENTO_ESCOLAR]: "bg-green-100 text-green-800 border-green-200",
    [TipoEvento.ATIVIDADE_PEDAGOGICA]: "bg-purple-100 text-purple-800 border-purple-200",
    [TipoEvento.OUTRO]: "bg-gray-100 text-gray-800 border-gray-200",
  }
  return cores[tipo] || "bg-gray-100 text-gray-800 border-gray-200"
}

export function CronogramaCard({ cronograma }: CronogramaCardProps) {
  const isPeriodo = cronograma.dataFim && cronograma.data.split('T')[0] !== cronograma.dataFim.split('T')[0];

  return (
    <Card className={`hover:shadow-md transition-shadow border-l-4 ${isPeriodo ? 'border-l-indigo-500' : 'border-l-blue-500'} overflow-hidden`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg font-bold leading-tight line-clamp-2">
            {cronograma.titulo}
          </CardTitle>
          <div className="flex flex-col items-end gap-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider whitespace-nowrap ${getCorTipo(cronograma.tipoEvento)}`}>
              {formatarTipoEvento(cronograma.tipoEvento)}
            </span>
            {isPeriodo && (
              <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 uppercase">
                Período
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
          {cronograma.descricao}
        </p>
        
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-xs text-muted-foreground font-medium">
            <CalendarDays className={`w-3.5 h-3.5 mr-1.5 ${isPeriodo ? 'text-indigo-500' : 'text-blue-500'}`} />
            {formatarIntervalo(cronograma.data, cronograma.dataFim)}
          </div>
          
          {cronograma.criador && (
            <div className="flex items-center text-xs text-muted-foreground pt-2 border-t border-dashed border-gray-100 mt-1">
              <User className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
              <span>{cronograma.criador.nome}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
