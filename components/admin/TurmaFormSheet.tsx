
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTurmasStore, TURMA } from '@/stores/useTurmasStore';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
import { Loader2, Plus } from 'lucide-react';
import { formatarNomeTurma } from '@/stores/useTurmasStore';

const turmaSchema = z.object({
  nome: z.nativeEnum(TURMA),
});

type TurmaFormValues = z.infer<typeof turmaSchema>;

interface TurmaFormSheetProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function TurmaFormSheet({ onSuccess, trigger }: TurmaFormSheetProps) {
  const [open, setOpen] = useState(false);
  const { cadastrarTurma, isLoading } = useTurmasStore();

  const form = useForm<TurmaFormValues>({
    resolver: zodResolver(turmaSchema),
  });

  async function onSubmit(data: TurmaFormValues) {
    try {
      const success = await cadastrarTurma(data.nome);
      
      if (success) {
        toast.success('Turma criada com sucesso!');
        setOpen(false);
        form.reset();
        if (onSuccess) onSuccess();
      } else {
        toast.error('Erro ao criar turma. Verifique se já existe.');
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar turma.');
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Turma
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Nova Turma</SheetTitle>
          <SheetDescription>
            Selecione o nome da turma para criar. O sistema gerencia automaticamente o ano.
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 p-2">
            
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Turma</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(TURMA).map((turma) => (
                        <SelectItem key={turma} value={turma}>
                          {formatarNomeTurma(turma)}
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
                Criar Turma
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
