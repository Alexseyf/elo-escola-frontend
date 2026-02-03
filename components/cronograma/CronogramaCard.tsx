"use client"

import { useState } from "react"
import { Cronograma, TipoEvento } from "@/types/cronograma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CalendarDays, User, Plus, Trash2, X } from "lucide-react"
import { deleteCronograma } from "@/utils/cronogramas"
import { useAuthStore } from "@/stores/useAuthStore"
import { toast } from "sonner"

interface CronogramaCardProps {
  cronograma: Cronograma
  onDelete?: () => void
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

const getBorderColor = (tipo: TipoEvento) => {
  const cores: Record<TipoEvento, string> = {
    [TipoEvento.REUNIAO]: "border-l-blue-300",
    [TipoEvento.FERIADO]: "border-l-red-300",
    [TipoEvento.RECESSO]: "border-l-yellow-300",
    [TipoEvento.EVENTO_ESCOLAR]: "border-l-green-300",
    [TipoEvento.ATIVIDADE_PEDAGOGICA]: "border-l-purple-300",
    [TipoEvento.OUTRO]: "border-l-gray-300",
  }
  return cores[tipo] || "border-l-gray-300"
}

export function CronogramaCard({ cronograma, onDelete }: CronogramaCardProps) {
  const isPeriodo = cronograma.dataFim && cronograma.data.split('T')[0] !== cronograma.dataFim.split('T')[0];
  const { user } = useAuthStore();
  const isAdmin = user?.roles?.includes('ADMIN');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCronograma(cronograma.id);

      if (result.success) {
        toast.success('Atividade removida com sucesso!');
        setIsAlertOpen(false);
        setIsDetailsOpen(false);
        onDelete?.();
      } else {
        toast.error(result.message || 'Erro ao remover atividade');
      }
    } catch (error) {
      toast.error('Erro ao remover atividade');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className={`hover:shadow-md transition-shadow border-l-4 ${getBorderColor(cronograma.tipoEvento)} overflow-hidden cursor-pointer group`}>
        <CardHeader className="pb-1">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-bold leading-tight line-clamp-2 flex-1 capitalize">
              {cronograma.titulo}
            </CardTitle>
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <DialogTitle className="text-xl font-bold mb-2 capitalize">
                        {cronograma.titulo}
                      </DialogTitle>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider ${getCorTipo(cronograma.tipoEvento)}`}>
                          {formatarTipoEvento(cronograma.tipoEvento)}
                        </span>
                        {isPeriodo && (
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
                      {cronograma.descricao}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Data</h4>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarDays className={`w-4 h-4 mr-2 ${isPeriodo ? 'text-indigo-500' : 'text-blue-500'}`} />
                      {formatarIntervalo(cronograma.data, cronograma.dataFim)}
                    </div>
                  </div>

                  {/* {cronograma.pularFinaisDeSemana && isPeriodo && (
                    <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                      ℹ️ Finais de semana não são considerados neste período
                    </div>
                  )} */}

                  {cronograma.criador && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Criado por</h4>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{cronograma.criador.nome}</span>
                      </div>
                    </div>
                  )}
                </div>

                {isAdmin && (
                  <DialogFooter className="border-t pt-4">
                    <Button
                      variant="destructive"
                      onClick={() => setIsAlertOpen(true)}
                      disabled={isDeleting}
                      className="flex items-center gap-2 w-full sm:w-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                      {isDeleting ? 'Removendo...' : 'Remover'}
                    </Button>
                  </DialogFooter>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="pb-1 pt-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center text-xs text-muted-foreground font-medium">
              <CalendarDays className={`w-3.5 h-3.5 mr-1.5 ${isPeriodo ? 'text-indigo-500' : 'text-blue-500'}`} />
              {formatarIntervalo(cronograma.data, cronograma.dataFim)}
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border uppercase tracking-wider whitespace-nowrap ${getCorTipo(cronograma.tipoEvento)}`}>
              {formatarTipoEvento(cronograma.tipoEvento)}
            </span>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover do Cronograma?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <span className="capitalize">{cronograma.titulo}</span> do cronograma?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
