"use client";

import { useFinancasStore } from "@/stores/useFinancasStore";
import { useTurmasStore } from "@/stores/useTurmasStore";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
            // Reset form
            setFormData({
                descricao: "",
                valor: 0,
                data: new Date().toISOString().split('T')[0],
                tipo: "OUTRO",
                turmaId: null
            });
        }
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Novo Lançamento Financeiro</DialogTitle>
                    <DialogDescription>
                        Registre uma nova despesa. Se não vincular a uma turma, o custo será rateado.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="descricao">Descrição</Label>
                        <Input
                            id="descricao"
                            placeholder="Ex: Salário Professora Ana"
                            value={formData.descricao}
                            onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="valor">Valor (R$)</Label>
                            <Input
                                id="valor"
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                value={formData.valor || ""}
                                onChange={e => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="data">Data</Label>
                            <Input
                                id="data"
                                type="date"
                                value={formData.data}
                                onChange={e => setFormData({ ...formData, data: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Tipo de Despesa</Label>
                        <CustomSelect
                            id="tipo"
                            name="tipo"
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as TipoPagamento })}
                            options={tiposOptions}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Vincular a Turma (Opcional)</Label>
                        <CustomSelect
                            id="turmaId"
                            name="turmaId"
                            value={formData.turmaId?.toString() || "null"}
                            onChange={(e) => setFormData({ ...formData, turmaId: e.target.value === "null" ? null : parseInt(e.target.value) })}
                            options={turmasOptions}
                            searchable
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="bg-slate-900" disabled={isLoading}>
                            {isLoading ? "Salvando..." : "Registrar Lançamento"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
