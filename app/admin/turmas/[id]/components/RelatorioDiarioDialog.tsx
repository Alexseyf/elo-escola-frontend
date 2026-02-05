"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { FileText, Loader2, Download, CheckCircle2, XCircle, MinusCircle } from "lucide-react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { useAuthStore } from "@/stores/useAuthStore";

interface RelatorioDiarioDialogProps {
    turmaId: number;
    turmaNome: string;
}

export function RelatorioDiarioDialog({ turmaId, turmaNome }: RelatorioDiarioDialogProps) {
    const user = useAuthStore(state => state.user);
    const isAdmin = user?.roles.includes('ADMIN');
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any | null>(null);

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    const [ano, setAno] = useState<string>(String(currentYear));
    const [mes, setMes] = useState<string>(String(currentMonth));

    const meses = [
        { value: '1', label: 'Janeiro' },
        { value: '2', label: 'Fevereiro' },
        { value: '3', label: 'Março' },
        { value: '4', label: 'Abril' },
        { value: '5', label: 'Maio' },
        { value: '6', label: 'Junho' },
        { value: '7', label: 'Julho' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Setembro' },
        { value: '10', label: 'Outubro' },
        { value: '11', label: 'Novembro' },
        { value: '12', label: 'Dezembro' },
    ];

    const anos = [currentYear - 1, currentYear, currentYear + 1];

    async function handleVisualize() {
        setLoading(true);
        try {
            const response = await api(`/api/v1/frequencias/turmas/${turmaId}/relatorio?mes=${mes}&ano=${ano}`, {
                method: 'GET'
            });

            if (!response.ok) throw new Error('Falha ao buscar dados do relatório');
            const data = await response.json();
            setReportData(data);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao buscar dados do relatório');
        } finally {
            setLoading(false);
        }
    }

    const processedData = useMemo(() => {
        if (!reportData) return null;

        const { frequencias, atividades } = reportData;
        const studentsMap = new Map<number, { name: string, days: Record<number, boolean> }>();
        const daysInMonth = new Date(Number(ano), Number(mes), 0).getDate();

        frequencias.forEach((freq: any) => {
            const day = new Date(freq.data).getUTCDate();
            const studentId = freq.aluno.id;

            if (!studentsMap.has(studentId)) {
                studentsMap.set(studentId, { name: freq.aluno.nome, days: {} });
            }

            const studentData = studentsMap.get(studentId)!;
            studentData.days[day] = freq.presente;
        });

        const studentsList = Array.from(studentsMap.values()).sort((a, b) => a.name.localeCompare(b.name));

        return {
            students: studentsList,
            atividades: atividades || [],
            daysInMonth,
            totalStudents: studentsMap.size
        };
    }, [reportData, mes, ano]);

    function createPDFDoc() {
        if (!reportData) return null;

        const doc = new jsPDF();
        const { frequencias, atividades } = reportData;

        // Same PDF generation logic...
        const studentsMap = new Map<number, { name: string, days: Record<number, boolean> }>();
        const rawFrequencies: any[] = frequencias;

        rawFrequencies.forEach(freq => {
            const day = new Date(freq.data).getUTCDate();
            const studentId = freq.aluno.id;

            if (!studentsMap.has(studentId)) {
                studentsMap.set(studentId, { name: freq.aluno.nome, days: {} });
            }

            const studentData = studentsMap.get(studentId)!;
            studentData.days[day] = freq.presente;
        });


        const schoolName = user?.school?.name || "Escola";

        doc.setFontSize(14);
        doc.text(schoolName, 105, 10, { align: "center" });

        doc.setFontSize(16);
        doc.text("DIÁRIO DE CLASSE", 105, 18, { align: "center" });

        doc.setFontSize(10);
        doc.text(`Turma: ${turmaNome}`, 14, 28);
        doc.text(`Mês/Ano: ${mes}/${ano}`, 14, 33);
        doc.text(`Total Alunos: ${studentsMap.size}`, 14, 38);

        const daysInMonth = new Date(Number(ano), Number(mes), 0).getDate();
        const daysColumns = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());

        const tableBody = Array.from(studentsMap.values()).map(student => {
            const row = [student.name];
            for (let d = 1; d <= daysInMonth; d++) {
                const status = student.days[d];
                if (status === true) row.push('P');
                else if (status === false) row.push('F');
                else row.push('-');
            }
            return row;
        });

        autoTable(doc, {
            startY: 40,
            head: [['Aluno', ...daysColumns]],
            body: tableBody,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 1 },
            headStyles: { fillColor: [200, 200, 200], textColor: [0, 0, 0] },
            columnStyles: {
                0: { cellWidth: 40 }
            }
        });

        const finalY = (doc as any).lastAutoTable.finalY || 150;
        doc.text("Legenda: P = Presente, F = Falta, - = Sem registro", 14, finalY + 10);
        doc.line(14, finalY + 30, 80, finalY + 30);
        doc.text("Assinatura do Professor", 14, finalY + 35);
        doc.line(110, finalY + 30, 180, finalY + 30);
        doc.text("Assinatura da Coordenação", 110, finalY + 35);

        if (atividades && atividades.length > 0) {
            doc.addPage();
            doc.text("REGISTRO DE ATIVIDADES PEDAGÓGICAS", 105, 15, { align: "center" });

            const atividadesBody = atividades.map((a: any) => {
                const dateObj = new Date(a.data);
                const day = dateObj.getUTCDate().toString().padStart(2, '0');
                const month = (dateObj.getUTCMonth() + 1).toString().padStart(2, '0');
                const yearLabel = dateObj.getUTCFullYear();
                return [`${day}/${month}/${yearLabel}`, a.objetivo?.codigo || '', a.descricao];
            });

            autoTable(doc, {
                startY: 25,
                head: [['Data', 'Código', 'Descrição']],
                body: atividadesBody,
                theme: 'grid',
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 35 }
                }
            });
        }

        return doc;
    }

    const handleDownload = () => {
        const doc = createPDFDoc();
        if (doc) {
            doc.save(`Diario_Classe_${turmaNome}_${mes}_${ano}.pdf`);
            toast.success("Download iniciado");
        }
    };

    // Reset logic
    const handleOpenChange = (isOpen: boolean) => {
        setOpen(isOpen);
        if (!isOpen) {
            // Optional: reset data? keeping it might be nice cache
            // setReportData(null); 
        }
    };

    const handleBack = () => {
        setReportData(null);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Diário de Classe
                </Button>
            </DialogTrigger>
            <DialogContent className={reportData ? "max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden" : "max-w-md"}>
                {!reportData ? (
                    <>
                        <DialogHeader className="p-6 pb-0">
                            <DialogTitle>Gerar Diário de Classe</DialogTitle>
                            <DialogDescription>
                                Selecione o período para visualizar e baixar o relatório.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Mês</Label>
                                    <Select value={mes} onValueChange={setMes}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {meses.map(m => (
                                                <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Ano</Label>
                                    <Select value={ano} onValueChange={setAno}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {anos.map(a => (
                                                <SelectItem key={a} value={String(a)}>{a}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="p-6 pt-0">
                            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                            <Button onClick={handleVisualize} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Visualizar Relatório
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="flex flex-col h-full bg-gray-50/50">
                        <DialogTitle className="sr-only">Visualização do Diário de Classe</DialogTitle>
                        {/* Header Mobile View */}
                        <div className="bg-white border-b px-6 py-4 flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="font-semibold text-lg">{turmaNome}</h2>
                                <p className="text-sm text-gray-500">{meses.find(m => m.value === mes)?.label} / {ano}</p>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6">
                            <Tabs defaultValue="frequencia" className="w-full">
                                <TabsList className="grid w-full grid-cols-2 mb-4">
                                    <TabsTrigger value="frequencia">Frequência</TabsTrigger>
                                    <TabsTrigger value="atividades">Atividades</TabsTrigger>
                                </TabsList>

                                <TabsContent value="frequencia" className="space-y-4">
                                    {processedData?.students.map(student => {
                                        const totalPresencas = Object.values(student.days).filter(v => v === true).length;
                                        const totalFaltas = Object.values(student.days).filter(v => v === false).length;

                                        return (
                                            <Card key={student.name} className="overflow-hidden">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h3 className="font-medium text-gray-900">{student.name}</h3>
                                                        <div className="text-xs font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">
                                                            {totalPresencas} P / {totalFaltas} F
                                                        </div>
                                                    </div>

                                                    {/* Visual Days Grid */}
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {Array.from({ length: processedData.daysInMonth }, (_, i) => i + 1).map(day => {
                                                            const status = student.days[day];
                                                            let colorClass = "bg-gray-100 border-gray-200 text-gray-300"; // None
                                                            let Icon = MinusCircle;

                                                            if (status === true) {
                                                                colorClass = "bg-green-100 border-green-200 text-green-600";
                                                                Icon = CheckCircle2;
                                                            } else if (status === false) {
                                                                colorClass = "bg-red-100 border-red-200 text-red-500";
                                                                Icon = XCircle;
                                                            }

                                                            return (
                                                                <div
                                                                    key={day}
                                                                    className={`w-6 h-6 rounded-md border flex items-center justify-center ${colorClass}`}
                                                                    title={`Dia ${day}: ${status === true ? 'Presente' : status === false ? 'Falta' : 'Sem registro'}`}
                                                                >
                                                                    <span className="text-[10px] font-bold">{day}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}

                                    {processedData?.students.length === 0 && (
                                        <div className="text-center py-10 text-gray-500">
                                            Nenhum registro de frequência encontrado.
                                        </div>
                                    )}

                                    <div className="flex gap-4 justify-center text-xs text-gray-500 pt-4">
                                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div> Presente</div>
                                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div> Falta</div>
                                        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div> Sem registro</div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="atividades" className="space-y-4">
                                    {processedData?.atividades.length === 0 ? (
                                        <div className="text-center py-10 text-gray-500">
                                            Nenhuma atividade registrada neste período.
                                        </div>
                                    ) : (
                                        processedData?.atividades.map((atividade: any, idx: number) => {
                                            const date = new Date(atividade.data);
                                            return (
                                                <Card key={idx}>
                                                    <CardContent className="p-4 space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-semibold text-gray-900">
                                                                    {date.getUTCDate().toString().padStart(2, '0')}/{(date.getUTCMonth() + 1).toString().padStart(2, '0')}
                                                                </span>
                                                                {atividade.objetivo?.codigo && (
                                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                                                        {atividade.objetivo.codigo}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-gray-600 leading-relaxed">
                                                            {atividade.descricao}
                                                        </p>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })
                                    )}
                                </TabsContent>
                            </Tabs>
                        </div>

                        {/* Footer Mobile View */}
                        <div className="bg-white border-t p-4 flex gap-3 shrink-0">
                            <Button variant="outline" onClick={handleBack} className="flex-1">
                                Voltar
                            </Button>
                            {isAdmin && (
                                <Button onClick={handleDownload} className="flex-1 gap-2">
                                    <Download className="h-4 w-4" />
                                    Baixar PDF
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
