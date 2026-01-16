import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usuarioSchema, UsuarioFormValues } from '@/schemas/usuario';
import { useUsuariosStore } from '@/stores/useUsuariosStore';
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
import { Loader2, Plus } from 'lucide-react';

interface UserFormSheetProps {
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function UserFormSheet({ onSuccess, trigger }: UserFormSheetProps) {
  const [open, setOpen] = useState(false);
  const { criarUsuario, isLoading } = useUsuariosStore();

  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      senha: '',
      roles: ['PROFESSOR'], // Default role
    }
  });

  async function onSubmit(data: UsuarioFormValues) {
    try {
      // Remove empty password if not provided (backend handles strictness or generation)
      if (!data.senha) delete data.senha;
      
      const result = await criarUsuario(data);
      
      if (result) {
        toast.success('Usuário criado com sucesso!');
        setOpen(false);
        form.reset();
        if (onSuccess) onSuccess();
      } else {
        // Error handling is done in store but we can add extra feedback here if needed
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar usuário.');
    }
  }

  // Helper to handle role selection (single role for UI simplicity, mapped to array)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRoleChange = (role: string, field: any) => {
    field.onChange([role]);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Novo Usuário</SheetTitle>
          <SheetDescription>
            Cadastre um novo usuário no sistema.
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
                    <Input placeholder="João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="joao@escola.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="roles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Perfil</FormLabel>
                      <Select 
                        onValueChange={(val) => handleRoleChange(val, field)} 
                        defaultValue={field.value?.[0]}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="PROFESSOR">Professor</SelectItem>
                          <SelectItem value="ADMIN">Administrador</SelectItem>
                          <SelectItem value="ALUNO">Aluno</SelectItem>
                          <SelectItem value="RESPONSAVEL">Responsável</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <FormField
              control={form.control}
              name="senha"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Gerada automaticamente se vazio" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Usuário
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
