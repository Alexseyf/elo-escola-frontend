import { Evento } from "@/types/evento";
import { Calendar, Clock, Edit, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatarNomeTurma } from "@/stores/useTurmasStore";
import { TipoEvento } from "@/types/cronograma";

interface EventListProps {
    events: Evento[];
    onEdit?: (event: Evento) => void;
    onDelete?: (id: number) => void;
    showActions?: boolean;
}

const formatarTipoEvento = (tipo: string) => {
    const tipos: Record<string, string> = {
        'REUNIAO': "Reunião",
        'FERIADO': "Feriado",
        'RECESSO': "Recesso",
        'EVENTO_ESCOLAR': "Evento Escolar",
        'ATIVIDADE_PEDAGOGICA': "Atividade Pedagógica",
        'OUTRO': "Outro",
    };
    return tipos[tipo] || tipo.replace('_', ' ');
}

const getCorTipo = (tipo: string) => {
    const cores: Record<string, string> = {
        'REUNIAO': "bg-blue-100 text-blue-800 border-blue-200",
        'FERIADO': "bg-red-100 text-red-800 border-red-200",
        'RECESSO': "bg-yellow-100 text-yellow-800 border-yellow-200",
        'EVENTO_ESCOLAR': "bg-green-100 text-green-800 border-green-200",
        'ATIVIDADE_PEDAGOGICA': "bg-purple-100 text-purple-800 border-purple-200",
        'OUTRO': "bg-gray-100 text-gray-800 border-gray-200",
    };
    return cores[tipo] || "bg-gray-100 text-gray-800 border-gray-200";
}

const getCorBordaTipo = (tipo: string) => {
    const cores: Record<string, string> = {
        'REUNIAO': "border-l-blue-500",
        'FERIADO': "border-l-red-500",
        'RECESSO': "border-l-yellow-500",
        'EVENTO_ESCOLAR': "border-l-green-500",
        'ATIVIDADE_PEDAGOGICA': "border-l-purple-500",
        'OUTRO': "border-l-gray-500",
    };
    return cores[tipo] || "border-l-gray-500";
}

const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR", {
        weekday: 'long',
        day: "numeric",
        month: "long",
        timeZone: "UTC",
    });
}

export function EventList({ events, onEdit, onDelete, showActions = false }: EventListProps) {
    if (events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                <Calendar className="w-10 h-10 text-gray-300 mb-2" />
                <p className="text-gray-500 font-medium">Nenhum evento agendado</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {events.map((event) => (
                <div
                    key={event.id}
                    className={`bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${getCorBordaTipo(event.tipoEvento)}`}
                >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-gray-900 text-lg">{event.titulo}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge className={`text-xs font-semibold border uppercase tracking-wider ${getCorTipo(event.tipoEvento)}`}>
                                            {formatarTipoEvento(event.tipoEvento)}
                                        </Badge>
                                        {event.turma && (
                                            <Badge variant="secondary" className="text-xs font-normal bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                {formatarNomeTurma(event.turma.nome)}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-600 text-sm leading-relaxed">{event.descricao}</p>

                            <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    <span className="capitalize">
                                        {formatarData(event.data)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                        {event.horaInicio} - {event.horaFim}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {showActions && (
                            <div className="flex items-center gap-2 md:self-start">
                                <Button variant="ghost" size="icon" onClick={() => onEdit?.(event)} className="h-8 w-8 text-gray-500 hover:text-blue-600">
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => onDelete?.(event.id)} className="h-8 w-8 text-gray-500 hover:text-red-600">
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
