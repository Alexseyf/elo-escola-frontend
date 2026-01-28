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
            <Button variant="soft-green" className="gap-2" disabled>
                <Lock className="h-4 w-4" />
                Mês Fechado
            </Button>
        );
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm" disabled={isLoading}>
                    <Unlock className="h-4 w-4" />
                    <span className="hidden sm:inline">Fechar Mês</span>
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl max-w-[90vw] sm:max-w-md border-none shadow-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-xl font-bold text-gray-900">Confirmar fechamento?</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-500">
                        Ao fechar o mês {mes}/{ano}, todos os registros financeiros se tornarão <strong className="text-gray-900">imutáveis</strong>.
                        Não será possível alterar lançamentos futuramente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4 gap-2">
                    <AlertDialogCancel className="rounded-xl border-gray-100">Voltar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmAction} className="bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-200">
                        Confirmar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
