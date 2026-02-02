"use client";

import { useEffect, useState, useMemo } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTurmasStore } from "@/stores/useTurmasStore";
import { EventList } from "@/components/eventos/EventList";
import { EventForm } from "@/components/eventos/EventForm";
import { Evento, CreateEventoDTO, UpdateEventoDTO } from "@/types/evento";
import { getEventos, createEvento, updateEvento, deleteEvento } from "@/utils/eventos";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Calendar, Plus } from "lucide-react";
import { toast } from "sonner";

export default function ProfessorEventosPage() {
    const user = useAuthStore((state) => state.user);
    const { turmas, fetchTurmas } = useTurmasStore();
    const [events, setEvents] = useState<Evento[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Evento | undefined>(undefined);

    const profTurmas = useMemo(() =>
        turmas.filter(t => t.professores?.some(p => p.usuarioId === user?.id)),
        [turmas, user?.id]
    );

    useEffect(() => {
        fetchTurmas();
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setIsLoading(true);
        const data = await getEventos();
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
        <RouteGuard allowedRoles={['PROFESSOR']}>
            <div className="p-4 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                            <Calendar className="w-8 h-8 text-blue-600" />
                            Avisos da Turma
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Gerencie os avisos para suas turmas.
                        </p>
                    </div>
                    <Button onClick={handleCreate}>
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Aviso
                    </Button>
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
                                Preencha os dados do evento da turma.
                            </DialogDescription>
                        </DialogHeader>
                        <EventForm
                            initialData={editingEvent}
                            turmas={profTurmas}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsModalOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>
        </RouteGuard>
    );
}
