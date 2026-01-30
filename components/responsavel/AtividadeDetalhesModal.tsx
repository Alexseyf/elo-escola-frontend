"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Atividade } from "@/types/atividades";
import { formatarCampoExperiencia } from "@/stores/useCamposStore";
import { SEMESTRE_LABELS } from "@/types/atividades";
import { Calendar, Clock, BookOpen, Target, User, FileText } from "lucide-react";

interface AtividadeDetalhesModalProps {
    atividade: Atividade | null;
    isOpen: boolean;
    onClose: () => void;
}

export function AtividadeDetalhesModal({
    atividade,
    isOpen,
    onClose,
}: AtividadeDetalhesModalProps) {
    if (!atividade) return null;

    const formatarData = (dataISO: string) => {
        const datePart = dataISO.split("T")[0];
        const [year, month, day] = datePart.split("-");
        return `${day}/${month}/${year}`;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <FileText className="h-5 w-5 text-blue-600" />
                        Detalhes da Atividade
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Informações detalhadas sobre a atividade pedagógica realizada.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">
                                <Calendar className="h-3 w-3" />
                                Data de Realização
                            </div>
                            <p className="font-semibold text-gray-900">{formatarData(atividade.data)}</p>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">
                                <Clock className="h-3 w-3" />
                                Duração
                            </div>
                            <p className="font-semibold text-gray-900">{atividade.quantHora} hora(s)</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">
                                <Target className="h-3 w-3" />
                                Campo de Experiência
                            </div>
                            <div className="bg-blue-50 text-blue-900 px-3 py-2 rounded-lg border border-blue-100 font-medium text-sm">
                                {formatarCampoExperiencia(atividade.campoExperiencia)}
                            </div>
                        </div>

                        {atividade.objetivo && (
                            <div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">
                                    <BookOpen className="h-3 w-3" />
                                    Objetivo de Aprendizagem
                                </div>
                                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-3">
                                    <p className="text-xs font-bold text-indigo-900 mb-1">
                                        {atividade.objetivo.codigo}
                                    </p>
                                    <p className="text-sm text-indigo-800 leading-relaxed">
                                        {atividade.objetivo.descricao}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1 uppercase font-bold tracking-wider">
                                <FileText className="h-3 w-3" />
                                Descrição da Atividade
                            </div>
                            <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm">
                                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {atividade.descricao}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>Professor: {atividade.professor?.nome || 'Não informado'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{SEMESTRE_LABELS[atividade.periodo]} - {atividade.ano}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
