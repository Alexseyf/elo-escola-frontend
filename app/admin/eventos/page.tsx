"use client";

import { useEffect, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useTurmasStore, formatarNomeTurma } from "@/stores/useTurmasStore";
import { EventList } from "@/components/eventos/EventList";
import { EventForm } from "@/components/eventos/EventForm";
import { Evento, CreateEventoDTO, UpdateEventoDTO } from "@/types/evento";
import { getEventos, createEvento, updateEvento, deleteEvento } from "@/utils/eventos";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Filter } from "lucide-react";
import { toast } from "sonner";

export default function AdminEventosPage() {
    const { turmas, fetchTurmas } = useTurmasStore();
    const [events, setEvents] = useState<Evento[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Evento | undefined>(undefined);
    const [filterTurmaId, setFilterTurmaId] = useState<string>("all");

    useEffect(() => {
        fetchTurmas();
    }, []);

    useEffect(() => {
        loadEvents();
    }, [filterTurmaId]);

    const loadEvents = async () => {
        setIsLoading(true);
        const params: any = {};
        if (filterTurmaId !== "all") {
            params.turmaId = parseInt(filterTurmaId);
        }
        const data = await getEventos(params);
        setEvents(data);
        setIsLoading(false);
    };

    const handleCreate = () => {
        setEditingEvent(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (event: Evento) => {
        setEditingEvent(event);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Tem certeza que deseja excluir este evento?")) {
            const result = await deleteEvento(id);
            if (result.success) {
                toast.success("Aviso excluído com sucesso");
                loadEvents();
            } else {
                toast.error(result.message || "Erro ao excluir evento");
            }
        }
    };

    const handleSubmit = async (data: CreateEventoDTO | UpdateEventoDTO) => {
        let result;
        if (editingEvent) {
            result = await updateEvento(editingEvent.id, data);
        } else {
            result = await createEvento(data as CreateEventoDTO);
        }

        if (result.success) {
            toast.success(editingEvent ? "Aviso atualizado" : "Aviso criado");
            setIsModalOpen(false);
            loadEvents();
        } else {
            toast.error(result.message || "Erro ao salvar evento");
        }
    };

    return (
        <RouteGuard allowedRoles={['ADMIN', 'PLATFORM_ADMIN']}>
            <div className="p-4 md:p-8 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-8 h-8 text-blue-600" />
                            Gestão de Avisos
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Gerencie os avisos de todas as turmas da escola.
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Aviso
                    </Button>
                </div>

                {/* Filter Bar */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 flex items-center gap-4">
                    <Filter className="w-5 h-5 text-gray-500" />
                    <div className="w-full md:w-64">
                        <Select value={filterTurmaId} onValueChange={setFilterTurmaId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filtrar por Turma" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas as Turmas</SelectItem>
                                {turmas.map(t => (
                                    <SelectItem key={t.id} value={t.id.toString()}>
                                        {formatarNomeTurma(t.nome)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {isLoading ? (
                    <div className="text-center py-10">Carregando avisos...</div>
                ) : (
                    <EventList
                        events={events}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        showActions={true}
                    />
                )}

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle>{editingEvent ? "Editar Aviso" : "Novo Aviso"}</DialogTitle>
                            <DialogDescription>
                                Preencha os detalhes abaixo para {editingEvent ? "atualizar o" : "criar um novo"} evento escolar.
                            </DialogDescription>
                        </DialogHeader>
                        <EventForm
                            initialData={editingEvent}
                            turmas={turmas} // Admin sees all turmas
                            onSubmit={handleSubmit}
                            onCancel={() => setIsModalOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </RouteGuard>
    );
}
