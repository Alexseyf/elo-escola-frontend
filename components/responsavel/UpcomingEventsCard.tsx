"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Cronograma } from "@/types/cronograma"
import { getCronogramas } from "@/utils/cronogramas"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CalendarDays, ChevronRight, Calendar, User } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const formatarData = (dataString: string) => {
  const data = new Date(dataString)
  return data.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  })
}

const formatarTipoEvento = (tipo: string) => {
  const tipos: Record<string, string> = {
    REUNIAO: "Reunião",
    FERIADO: "Feriado",
    RECESSO: "Recesso",
    EVENTO_ESCOLAR: "Evento Escolar",
    ATIVIDADE_PEDAGOGICA: "Atividade Pedagógica",
    OUTRO: "Outro",
  }
  return tipos[tipo] || tipo
}

const getCorTipo = (tipo: string) => {
  const cores: Record<string, string> = {
    REUNIAO: "bg-blue-100 text-blue-800 border-blue-200",
    FERIADO: "bg-red-100 text-red-800 border-red-200",
    RECESSO: "bg-yellow-100 text-yellow-800 border-yellow-200",
    EVENTO_ESCOLAR: "bg-green-100 text-green-800 border-green-200",
    ATIVIDADE_PEDAGOGICA: "bg-purple-100 text-purple-800 border-purple-200",
    OUTRO: "bg-gray-100 text-gray-800 border-gray-200",
  }
  return cores[tipo] || "bg-gray-100 text-gray-800 border-gray-200"
}

export function UpcomingEventsCard() {
  const router = useRouter()
  const [cronogramas, setCronogramas] = useState<Cronograma[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Cronograma | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      const data = await getCronogramas({ isAtivo: true })
      setCronogramas(data)
      setIsLoading(false)
    }

    loadData()
  }, [])

  const upcomingEvents = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    return cronogramas
      .filter((evento) => {
        const eventoDate = new Date(evento.data)
        const eventoMonth = eventoDate.getUTCMonth()
        const eventoYear = eventoDate.getUTCFullYear()
        const eventoDay = new Date(eventoDate.getUTCFullYear(), eventoDate.getUTCMonth(), eventoDate.getUTCDate())

        return eventoYear === currentYear &&
          eventoMonth === currentMonth &&
          eventoDay >= today
      })
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
  }, [cronogramas])

  const displayedEvents = useMemo(() => {
    if (showAll) {
      return upcomingEvents
    }
    const limit = isMobile ? 3 : 6
    return upcomingEvents.slice(0, limit)
  }, [upcomingEvents, showAll, isMobile])

  const hasMoreEvents = upcomingEvents.length > displayedEvents.length

  const handleEventClick = (evento: Cronograma) => {
    setSelectedEvent(evento)
    setIsDialogOpen(true)
  }

  const formatarIntervalo = (inicio: string, fim?: string | null) => {
    if (!fim || inicio.split('T')[0] === fim.split('T')[0]) {
      return formatarData(inicio)
    }

    return `${formatarData(inicio)} - ${formatarData(fim)}`
  }

  const isPeriodo = (evento: Cronograma) => {
    return evento.dataFim && evento.data.split('T')[0] !== evento.dataFim.split('T')[0]
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Próximos Eventos - Cronograma
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (upcomingEvents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Próximos Eventos - Cronograma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhum evento programado para este mês</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Próximos Eventos - Cronograma
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {upcomingEvents.length} {upcomingEvents.length === 1 ? 'evento' : 'eventos'} este mês
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Grid de eventos - 2 por linha no desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {displayedEvents.map((evento) => (
              <div
                key={evento.id}
                onClick={() => handleEventClick(evento)}
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex-shrink-0 text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {new Date(evento.data).getUTCDate()}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase">
                    {formatarData(evento.data).split(' ')[1]}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm capitalize line-clamp-1">
                    {evento.titulo}
                  </h4>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase ${getCorTipo(evento.tipoEvento)}`}>
                    {formatarTipoEvento(evento.tipoEvento)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Botão de ação */}
          <div className="pt-2">
            {hasMoreEvents && !showAll ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAll(true)}
              >
                Mostrar Mais
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push('/responsavel/cronograma')}
              >
                Acessar Cronograma
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalhes do Evento */}
      {selectedEvent && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-xl font-bold mb-2 capitalize">
                    {selectedEvent.titulo}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${getCorTipo(selectedEvent.tipoEvento)}`}>
                      {formatarTipoEvento(selectedEvent.tipoEvento)}
                    </span>
                    {isPeriodo(selectedEvent) && (
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 uppercase">
                        Período
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Descrição</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedEvent.descricao}
                </p>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Data</h4>
                <div className="flex items-center text-sm text-muted-foreground">
                  <CalendarDays className={`w-4 h-4 mr-2 ${isPeriodo(selectedEvent) ? 'text-indigo-500' : 'text-blue-500'}`} />
                  {formatarIntervalo(selectedEvent.data, selectedEvent.dataFim)}
                </div>
              </div>

              {selectedEvent.pularFinaisDeSemana && isPeriodo(selectedEvent) && (
                <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                  ℹ️ Finais de semana não são considerados neste período
                </div>
              )}

              {selectedEvent.criador && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Criado por</h4>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <User className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{selectedEvent.criador.nome}</span>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
