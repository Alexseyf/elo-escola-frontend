"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Atividade } from "@/types/atividades";
import { formatarCampoExperiencia } from "@/stores/useCamposStore";
import { Calendar, Eye, Target } from "lucide-react";
import { AtividadeDetalhesModal } from "./AtividadeDetalhesModal";

interface AtividadeCardProps {
    atividade: Atividade;
}

export function AtividadeCard({ atividade }: AtividadeCardProps) {
    const [modalOpen, setModalOpen] = useState(false);

    const formatarData = (dataISO: string) => {
        const datePart = dataISO.split("T")[0];
        const [year, month, day] = datePart.split("-");
        return `${day}/${month}/${year}`;
    };

    return (
        <>
            <Card className="hover:shadow-md transition-all border-gray-100 overflow-hidden group">
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row md:items-center">
                        {/* Esquerda: Data em destaque (mobile: row, desktop: col) */}
                        <div className="bg-blue-50/50 px-4 py-3 md:py-6 md:w-32 flex md:flex-col items-center justify-center border-b md:border-b-0 md:border-r border-blue-100 gap-2">
                            <Calendar className="h-4 w-4 text-blue-600 md:hidden" />
                            <div className="text-xl font-bold text-blue-900 leading-none">
                                {atividade.data.split('T')[0].split('-')[2]}
                            </div>
                            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest md:mt-1">
                                {new Date(atividade.data).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}
                            </div>
                            <div className="text-[10px] text-blue-400 font-medium md:mt-0.5">
                                {atividade.data.split('T')[0].split('-')[0]}
                            </div>
                        </div>

                        {/* Centro: Info Resumida */}
                        <div className="flex-1 p-4 space-y-2">
                            <div className="flex items-center gap-2">
                                <Target className="h-3 w-3 text-blue-500" />
                                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-tight">
                                    {formatarCampoExperiencia(atividade.campoExperiencia)}
                                </span>
                            </div>

                            <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                                {atividade.descricao}
                            </p>

                            {atividade.objetivo && (
                                <div className="text-[11px] text-muted-foreground italic flex items-center gap-1">
                                    <span className="font-bold text-gray-400 uppercase not-italic">OBN:</span> {atividade.objetivo.codigo}
                                </div>
                            )}
                        </div>

                        {/* Direita: Ação */}
                        <div className="p-4 md:px-6 pt-0 md:pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full md:w-auto h-9 text-xs gap-2 border-blue-100 text-blue-700 hover:bg-blue-50 hover:text-blue-800 transition-colors"
                                onClick={() => setModalOpen(true)}
                            >
                                <Eye className="h-3 w-3" />
                                Ver Detalhes
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <AtividadeDetalhesModal
                atividade={atividade}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
            />
        </>
    );
}
