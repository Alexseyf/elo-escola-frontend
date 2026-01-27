"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Lock, Unlock } from "lucide-react";
import { useFinancasStore } from "@/stores/useFinancasStore";

interface MonthClosingProps {
    mes: number;
    ano: number;
    isFechado: boolean;
}

export function MonthClosing({ mes, ano, isFechado }: MonthClosingProps) {
    const { fecharMes, fetchBalanco, isLoading } = useFinancasStore();

    const handleConfirmAction = async () => {
        const success = await fecharMes(mes, ano);
        if (success) {
            fetchBalanco(mes, ano);
        }
    };

    if (isFechado) {
        return (
            <Button variant="outline" className="gap-2 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" disabled>
                <Lock className="h-4 w-4" />
                Mês Fechado
            </Button>
        );
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="default" className="gap-2 bg-slate-900" disabled={isLoading}>
                    <Unlock className="h-4 w-4" />
                    Fechar Mês
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar fechamento de mês?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Ao fechar o mês {mes}/{ano}, todos os registros financeiros se tornarão **imutáveis**.
                        Você não poderá adicionar, editar ou excluir lançamentos para este período futuramente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Voltar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmAction} className="bg-red-600 hover:bg-red-700">
                        Confirmar Fechamento
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
