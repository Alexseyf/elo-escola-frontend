"use client";

import { useEffect, useState } from "react";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { EventList } from "@/components/eventos/EventList";
import { Evento } from "@/types/evento";
import { getEventos } from "@/utils/eventos";
import { Calendar } from "lucide-react";

export default function ResponsavelEventosPage() {
    const [events, setEvents] = useState<Evento[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setIsLoading(true);
        const data = await getEventos();
        setEvents(data);
        setIsLoading(false);
    };

    return (
        <RouteGuard allowedRoles={['RESPONSAVEL']}>
            <div className="p-4 md:p-8 space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Calendar className="w-8 h-8 text-blue-600" />
                        Eventos da Escola
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Acompanhe os próximos eventos da turma do seu filho(a).
                    </p>
                </div>

                {isLoading ? (
                    <div className="text-center py-10">Carregando eventos...</div>
                ) : (
                    <EventList events={events} showActions={false} />
                )}
            </div>
        </RouteGuard>
    );
}
