"use client";

import { useFinancasStore } from "@/stores/useFinancasStore";
import { useTurmasStore } from "@/stores/useTurmasStore";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomSelect } from "@/components/CustomSelect";
import { useState, useEffect } from "react";
import { CreatePagamentoDTO, TipoPagamento } from "@/types/financas";

interface ExpenseFormProps {
    isOpen: boolean;
    onClose: () => void;
    mes: number;
    ano: number;
}

export function ExpenseForm({ isOpen, onClose, mes, ano }: ExpenseFormProps) {
    const { addPagamento, fetchPagamentos, fetchBalanco, isLoading } = useFinancasStore();
    const { turmas, fetchTurmas } = useTurmasStore();

    const [formData, setFormData] = useState<CreatePagamentoDTO>({
        descricao: "",
        valor: 0,
        data: new Date().toISOString().split('T')[0],
        tipo: "OUTRO",
        turmaId: null
    });

    useEffect(() => {
        if (isOpen && turmas.length === 0) {
            fetchTurmas();
        }
    }, [isOpen, turmas.length, fetchTurmas]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.valor <= 0) return;

        const success = await addPagamento(formData);
        if (success) {
            fetchPagamentos(mes, ano);
            fetchBalanco(mes, ano);
            onClose();
            setFormData({
                descricao: "",
                valor: 0,
                data: new Date().toISOString().split('T')[0],
                tipo: "OUTRO",
                turmaId: null
            });
        }
    };

    // Removed local displayValor state since we derive it directly from formData.valor

    const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        // Se rawValue for vazio string, undefined. Se for '0' ou '00', é 0.
        const numericValue = rawValue === '' ? 0 : Number(rawValue) / 100;
        setFormData({ ...formData, valor: numericValue });
    };

    const tiposOptions = [
        { value: 'SALARIO', label: 'Salário' },
        { value: 'EXTRA', label: 'Extra' },
        { value: 'VALE_TRANSPORTE', label: 'Vale Transporte' },
        { value: 'ALUGUEL', label: 'Aluguel' },
        { value: 'AGUA', label: 'Água' },
        { value: 'LUZ', label: 'Luz' },
        { value: 'INTERNET', label: 'Internet' },
        { value: 'MANUTENCAO_REFORMA', label: 'Manutenção/Reforma' },
        { value: 'OUTRO', label: 'Outro' }
    ];

    const turmasOptions = [
        { value: "null", label: "Gasto Geral (Escola)" },
        ...turmas.map(t => ({ value: t.id.toString(), label: t.nome }))
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-[24px] border-none shadow-2xl p-0 overflow-hidden">
                <div className="bg-blue-600 px-6 py-8 text-white">
                    <DialogTitle className="text-2xl font-bold">Novo Lançamento</DialogTitle>
                    <DialogDescription className="text-blue-100 mt-1 font-medium italic">
                        Registre uma nova despesa no sistema.
                    </DialogDescription>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <Label htmlFor="descricao" className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Descrição</Label>
                        <Input
                            id="descricao"
                            placeholder="Ex: Salário Professora Ana"
                            value={formData.descricao}
                            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                            required
                            className="bg-gray-50/50 border-gray-100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="valor" className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Valor</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">R$</span>
                                <Input
                                    id="valor"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="0,00"
                                    className="pl-10 text-right font-bold bg-gray-50/50 border-gray-100"
                                    value={
                                        formData.valor !== undefined && formData.valor !== null
                                            ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(formData.valor)
                                            : ''
                                    }
                                    onChange={handleValorChange}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="data" className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Data</Label>
                            <Input
                                id="data"
                                type="date"
                                className="bg-gray-50/50 border-gray-100 font-medium"
                                value={formData.data}
                                onChange={e => setFormData({ ...formData, data: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Tipo de Despesa</Label>
                        <CustomSelect
                            id="tipo"
                            name="tipo"
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoPagamento })}
                            options={tiposOptions}
                            className="bg-gray-50/50 border-gray-100"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-xs font-bold uppercase tracking-wider text-gray-400 ml-1">Vincular Turma (Opcional)</Label>
                        <CustomSelect
                            id="turmaId"
                            name="turmaId"
                            value={formData.turmaId?.toString() || "null"}
                            onChange={(e) => setFormData({ ...formData, turmaId: e.target.value === "null" ? null : parseInt(e.target.value) })}
                            options={turmasOptions}
                            searchable
                            disableMobileSearch
                            className="bg-gray-50/50 border-gray-100"
                        />
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                        <Button type="submit" variant="success" className="w-full h-12 text-base shadow-lg" disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Confirmar Lançamento"}
                        </Button>
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading} className="text-gray-400 hover:text-gray-500">
                            Cancelar
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
