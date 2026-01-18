"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useTurmasStore, type TurmaData } from "@/stores/useTurmasStore"
import { useUsuariosStore } from "@/stores/useUsuariosStore"
import { RouteGuard } from "@/components/auth/RouteGuard"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, GraduationCap, Users, UserPlus, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export default function TurmaDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const { fetchTurmaById, vincularProfessor, desvincularProfessor, isLoading: isTurmaLoading, fetchTurmas } = useTurmasStore();
  const { fetchUsuarios, usuarios } = useUsuariosStore();

  const [turma, setTurma] = useState<TurmaData | null>(null);
  const [selectedProfessor, setSelectedProfessor] = useState<string>('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [professorToUnbind, setProfessorToUnbind] = useState<number | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);

  useEffect(() => {
    if (id) {
      loadTurma();
    }
    fetchUsuarios();
  }, [id, fetchTurmas, fetchUsuarios]);

  async function loadTurma() {
    const data = await fetchTurmaById(id);
    setTurma(data);
  }

  async function handleVincularProfessor() {
    if (!selectedProfessor) return;
    
    setIsLinking(true);
    const result = await vincularProfessor(id, Number(selectedProfessor));
    
    if (result.success) {
      toast.success(result.message);
      setIsSheetOpen(false);
      setSelectedProfessor('');
      loadTurma();
    } else {
      toast.error(result.message);
    }
    setIsLinking(false);
  }

  async function handleDesvincularProfessor() {
    if (!professorToUnbind) return;
    
    setIsUnlinking(true);
    const result = await desvincularProfessor(id, professorToUnbind);
    
    if (result.success) {
      toast.success(result.message);
      setProfessorToUnbind(null);
      loadTurma();
    } else {
      toast.error(result.message);
    }
    setIsUnlinking(false);
  }

  const professoresDisponiveis = usuarios.filter(u => u.roles.includes('PROFESSOR'));

  if (isTurmaLoading && !turma) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!turma) {
    return (
        <div className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Turma não encontrada</h2>
            <Button variant="outline" onClick={() => router.back()}>Voltar</Button>
        </div>
    );
  }

  return (
    <RouteGuard allowedRoles={['ADMIN']}>
      <div className="p-6 space-y-6">
        <AlertDialog open={professorToUnbind !== null} onOpenChange={(open) => !open && !isUnlinking && setProfessorToUnbind(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Remover vínculo do professor?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação irá remover o professor desta turma. O usuário continuará ativo no sistema.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isUnlinking}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={(e) => {
                            e.preventDefault();
                            handleDesvincularProfessor();
                        }} 
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isUnlinking}
                    >
                        {isUnlinking ? 'Removendo...' : 'Remover'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{turma.nome}</h1>
            <p className="text-gray-500">Ano Letivo: {turma.ano}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Professores Section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Professores Vinculados
                </CardTitle>
                <CardDescription>Gerencie os professores desta turma</CardDescription>
              </div>
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetTrigger asChild>
                    <Button 
                      size="sm" 
                      disabled={turma.professores && turma.professores.length > 0}
                      title={turma.professores && turma.professores.length > 0 ? "Limite de 1 professor por turma atingido" : ""}
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Vincular
                    </Button>
                </SheetTrigger>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>Vincular Professor</SheetTitle>
                        <SheetDescription>
                            Selecione um professor para vincular a esta turma.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="py-6 px-4">
                        <Select value={selectedProfessor} onValueChange={setSelectedProfessor}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione um professor..." />
                            </SelectTrigger>
                            <SelectContent>
                                {professoresDisponiveis.map(p => (
                                    <SelectItem key={p.id} value={String(p.id)}>{p.nome}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <SheetFooter>
                        <Button onClick={handleVincularProfessor} disabled={isLinking}>
                            {isLinking ? 'Vinculando...' : 'Confirmar Vínculo'}
                        </Button>
                    </SheetFooter>
                </SheetContent>
              </Sheet>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {turma.professores && turma.professores.length > 0 ? (
                        turma.professores.map((prof) => (
                            <div key={prof.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                                        {prof.usuario.nome.substring(0,2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium">{prof.usuario.nome}</p>
                                        <p className="text-xs text-gray-500">{prof.usuario.email}</p>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => setProfessorToUnbind(prof.usuarioId)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">Nenhum professor vinculado.</p>
                    )}
                </div>
            </CardContent>
          </Card>

          {/* Alunos Section */}
          <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Alunos ({turma.alunos?.length || 0})
                </CardTitle>
                <CardDescription>Lista de alunos matriculados</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                    {turma.alunos && turma.alunos.length > 0 ? (
                        turma.alunos.map((aluno) => (
                            <div key={aluno.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                                <span className="font-medium text-sm">{aluno.nome}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => router.push(`/admin/alunos/${aluno.id}`)}>
                                    <ChevronLeft className="h-4 w-4 rotate-180" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">Nenhum aluno matriculado.</p>
                    )}
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RouteGuard>
  );
}
