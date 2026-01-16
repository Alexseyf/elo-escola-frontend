import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { alunoSchema, AlunoFormValues } from '@/schemas/aluno';
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
import { toast } from 'sonner';
import { Loader2, Plus, Pencil } from 'lucide-react';

interface AlunoFormSheetProps {
  aluno?: AlunoDetalhes | null;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function AlunoFormSheet({ aluno, onSuccess, trigger }: AlunoFormSheetProps) {
  const [open, setOpen] = useState(false);
  const { createAluno, updateAluno, isLoading } = useAlunosStore();
  const { turmas, fetchTurmas } = useTurmasStore();

  const isEditing = !!aluno;

  const form = useForm({
    resolver: zodResolver(alunoSchema),
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

  async function onSubmit(data: AlunoFormValues) {
    try {
      let result;
      const payload: CreateAlunoData = {
        ...data,
        mensalidade: data.mensalidade || 0
      };

      if (isEditing && aluno) {
        result = await updateAluno(aluno.id, payload);
      } else {
        result = await createAluno(payload as CreateAlunoData);
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant={isEditing ? "ghost" : "default"} size={isEditing ? "icon" : "default"}>
            {isEditing ? <Pencil className="h-4 w-4" /> : <><Plus className="mr-2 h-4 w-4" /> Novo Aluno</>}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Editar Aluno' : 'Novo Aluno'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Atualize os dados do aluno.' : 'Cadastre um novo aluno no sistema.'}
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 px-2">
            
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Joãozinho" {...field} />
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

            <SheetFooter>
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
