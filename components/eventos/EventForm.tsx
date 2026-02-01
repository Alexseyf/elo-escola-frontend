import { useState, useEffect } from "react";
import { CreateEventoDTO, UpdateEventoDTO, Evento } from "@/types/evento";
import { TipoEvento } from "@/types/cronograma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Turma } from "@/utils/turmas";
import { formatarNomeTurma } from "@/stores/useTurmasStore";

interface EventFormProps {
    initialData?: Evento;
    turmas: Turma[];
    onSubmit: (data: CreateEventoDTO | UpdateEventoDTO) => Promise<void>;
    onCancel: () => void;
}

export function EventForm({ initialData, turmas, onSubmit, onCancel }: EventFormProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateEventoDTO>({
        titulo: "",
        descricao: "",
        data: new Date().toISOString().split('T')[0],
        horaInicio: "13:00",
        horaFim: "17:00",
        tipoEvento: TipoEvento.OUTRO,
        turmaId: 0,
        isAtivo: true
    });

    useEffect(() => {
        if (initialData) {
            const resolvedTurmaId = initialData.turmaId || initialData.turma?.id || 0;
            setFormData({
                titulo: initialData.titulo,
                descricao: initialData.descricao,
                data: new Date(initialData.data).toISOString().split('T')[0],
                horaInicio: initialData.horaInicio,
                horaFim: initialData.horaFim,
                tipoEvento: initialData.tipoEvento,
                turmaId: resolvedTurmaId,
                isAtivo: initialData.isAtivo
            });
        } else {
            setFormData({
                titulo: "",
                descricao: "",
                data: new Date().toISOString().split('T')[0],
                horaInicio: "13:00",
                horaFim: "17:00",
                tipoEvento: TipoEvento.OUTRO,
                turmaId: 0,
                isAtivo: true
            });
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!formData.turmaId || formData.turmaId === 0 || isNaN(formData.turmaId)) {
                alert("Selecione uma turma");
                return;
            }
            await onSubmit(formData);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo de Evento</Label>
                    {(() => {
                        return (
                            <Select
                                value={formData.tipoEvento}
                                onValueChange={(value) => {
                                    if (Object.values(TipoEvento).includes(value as TipoEvento)) {
                                        setFormData({ ...formData, tipoEvento: value as TipoEvento });
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(TipoEvento).map((tipo) => (
                                        <SelectItem key={tipo} value={tipo}>
                                            {tipo.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        );
                    })()}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="turma">Turma</Label>
                    {(() => {
                        const selectValue = formData.turmaId > 0 ? formData.turmaId.toString() : "";
                        return (
                            <Select
                                value={selectValue}
                                onValueChange={(value) => {
                                    const parsed = parseInt(value);
                                    if (!isNaN(parsed)) {
                                        setFormData({ ...formData, turmaId: parsed });
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione a turma" />
                                </SelectTrigger>
                                <SelectContent>
                                    {turmas.map((turma) => (
                                        <SelectItem key={turma.id} value={turma.id.toString()}>
                                            {formatarNomeTurma(turma.nome)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        );
                    })()}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Horário de Início</Label>
                    <div className="flex gap-2">
                        <Select
                            value={formData.horaInicio.split(':')[0] || '07'}
                            onValueChange={(hora) => {
                                if (hora && hora !== "") {
                                    const minuto = formData.horaInicio.split(':')[1] || '00';
                                    setFormData({ ...formData, horaInicio: `${hora}:${minuto}` });
                                }
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Hora" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 13 }, (_, i) => {
                                    const hour = (i + 7).toString().padStart(2, '0');
                                    return (
                                        <SelectItem key={hour} value={hour}>
                                            {hour}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        <Select
                            value={formData.horaInicio.split(':')[1] || '00'}
                            onValueChange={(minuto) => {
                                if (minuto && minuto !== "") {
                                    const hora = formData.horaInicio.split(':')[0] || '07';
                                    setFormData({ ...formData, horaInicio: `${hora}:${minuto}` });
                                }
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Min" />
                            </SelectTrigger>
                            <SelectContent>
                                {['00', '15', '30', '45'].map((min) => (
                                    <SelectItem key={min} value={min}>
                                        {min}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Horário de Fim</Label>
                    <div className="flex gap-2">
                        <Select
                            value={formData.horaFim.split(':')[0] || '07'}
                            onValueChange={(hora) => {
                                if (hora && hora !== "") {
                                    const minuto = formData.horaFim.split(':')[1] || '00';
                                    setFormData({ ...formData, horaFim: `${hora}:${minuto}` });
                                }
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Hora" />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 13 }, (_, i) => {
                                    const hour = (i + 7).toString().padStart(2, '0');
                                    return (
                                        <SelectItem key={hour} value={hour}>
                                            {hour}
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>
                        <Select
                            value={formData.horaFim.split(':')[1] || '00'}
                            onValueChange={(minuto) => {
                                if (minuto && minuto !== "") {
                                    const hora = formData.horaFim.split(':')[0] || '07';
                                    setFormData({ ...formData, horaFim: `${hora}:${minuto}` });
                                }
                            }}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Min" />
                            </SelectTrigger>
                            <SelectContent>
                                {['00', '15', '30', '45'].map((min) => (
                                    <SelectItem key={min} value={min}>
                                        {min}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    required
                />
            </div>

            <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
                    Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : (initialData ? "Atualizar" : "Salvar")}
                </Button>
            </div>
        </form>
    );
}
