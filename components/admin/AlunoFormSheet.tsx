import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { alunoSchema, updateAlunoSchema, AlunoFormValues } from '@/schemas/aluno';
import { useAlunosStore, AlunoDetalhes, CreateAlunoData } from '@/stores/useAlunosStore';
import { useTurmasStore } from '@/stores/useTurmasStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger
} from '@/components/ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { toast } from 'sonner';
import { Loader2, Plus, Pencil, Power, CheckCircle2 } from 'lucide-react';

interface AlunoFormSheetProps {
  aluno?: AlunoDetalhes | null;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function AlunoFormSheet({ aluno, onSuccess, trigger }: AlunoFormSheetProps) {
  const [open, setOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const { createAluno, updateAluno, deleteAluno, isLoading } = useAlunosStore();
  const { turmas, fetchTurmas } = useTurmasStore();

  const isEditing = !!aluno;

  const form = useForm<AlunoFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(isEditing ? updateAlunoSchema : alunoSchema) as any,
    defaultValues: {
      nome: '',
      dataNasc: '',
      turmaId: 0,
      mensalidade: undefined as number | undefined
    }
  });

  useEffect(() => {
    if (open) {
      fetchTurmas();
      if (aluno && isEditing) {
        form.reset({
          nome: aluno.nome,
          dataNasc: aluno.dataNasc ? aluno.dataNasc.split('T')[0] : '',
          turmaId: aluno.turmaId || (aluno.turma?.id) || 0,
          mensalidade: aluno.mensalidade || undefined
        });
      } else {
        form.reset({
          nome: '',
          dataNasc: '',
          turmaId: 0,
          mensalidade: undefined
        });
      }
    }
  }, [open, aluno, isEditing, form, fetchTurmas]);

  function onInvalid(errors: any) {
    console.log('Aluno Form Errors:', errors);
    toast.error('Por favor, preencha o valor da mensalidade.');
  }

  async function onSubmit(data: AlunoFormValues) {
    try {
      let result;
      const payload: CreateAlunoData = {
        ...data,
        dataNasc: `${data.dataNasc}T00:00:00.000Z`,
        mensalidade: data.mensalidade
      };

      if (isEditing && aluno) {
        result = await updateAluno(aluno.id, payload);
      } else {
        result = await createAluno(payload);
      }

      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar aluno.');
    }
  }

  async function handleToggleStatus() {
    if (!aluno) return;
    try {
      setIsToggling(true);
      if (aluno.isAtivo) {
        const result = await deleteAluno(aluno.id);
        if (result.success) toast.success(result.message);
        else toast.error(result.message);
      } else {
        const result = await updateAluno(aluno.id, { isAtivo: true });
        if (result.success) toast.success('Aluno ativado com sucesso!');
        else toast.error(result.message);
      }
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(aluno.isAtivo ? 'Erro ao desativar aluno.' : 'Erro ao ativar aluno.');
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant={isEditing ? "ghost" : "default"} size={isEditing ? "icon" : "default"}>
            {isEditing ? <Pencil className="h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" /> Novo Aluno</>}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Editar Aluno' : 'Novo Aluno'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Atualize os dados do aluno.' : 'Cadastre um novo aluno no sistema.'}
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6 py-4 px-2">

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do aluno" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dataNasc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" max={new Date().toISOString().split('T')[0]} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mensalidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensalidade (R$)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0,00"
                        value={field.value ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(Number(field.value)) : ''}
                        onChange={(e) => {
                          const rawValue = e.target.value.replace(/\D/g, '');
                          const numberValue = rawValue ? Number(rawValue) / 100 : undefined;
                          field.onChange(numberValue);
                        }}
                        maxLength={15}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="turmaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turma</FormLabel>
                  <Select
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={field.value ? String(field.value) : undefined}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma turma" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {turmas.map((turma) => (
                        <SelectItem key={turma.id} value={String(turma.id)}>
                          {turma.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="flex-col sm:flex-row gap-2">
              {isEditing && aluno && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      type="button"
                      disabled={isToggling}
                      className={aluno.isAtivo
                        ? "border-red-600 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        : "border-green-600 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"}
                    >
                      {isToggling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        aluno.isAtivo ? <Power className="h-4 w-4 mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      {aluno.isAtivo ? "Desativar Aluno" : "Ativar Aluno"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{aluno.isAtivo ? "Desativar Aluno?" : "Ativar Aluno?"}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {aluno.isAtivo
                          ? <span>Esta ação irá inativar o aluno <strong>{aluno.nome}</strong>.</span>
                          : <span>Esta ação irá ativar o aluno <strong>{aluno.nome}</strong> novamente.</span>
                        }
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleToggleStatus}
                        className={aluno.isAtivo ? "bg-destructive text-white hover:bg-destructive/90" : "bg-green-600 hover:bg-green-700"}
                      >
                        Confirmar {aluno.isAtivo ? "Inativação" : "Ativação"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Salvar Alterações' : 'Criar Aluno'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
