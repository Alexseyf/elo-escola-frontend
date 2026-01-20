import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { usuarioSchema, updateUsuarioSchema, UsuarioFormValues } from '@/schemas/usuario';
import { useUsuariosStore, Usuario } from '@/stores/useUsuariosStore';
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
import { Loader2, Plus, Power, CheckCircle2 } from 'lucide-react';

interface UserFormSheetProps {
  usuario?: Usuario;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function UserFormSheet({ usuario, onSuccess, trigger }: UserFormSheetProps) {
  const [open, setOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const { criarUsuario, atualizarUsuario, deletarUsuario, isLoading } = useUsuariosStore();
  
  const isEditing = !!usuario;

  const form = useForm<UsuarioFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(isEditing ? updateUsuarioSchema : usuarioSchema) as any,
    defaultValues: {
      nome: '',
      email: '',
      cpf: '',
      rg: '',
      dataNascimento: '',
      telefone: '',
      telefoneComercial: '',
      enderecoLogradouro: '',
      enderecoNumero: '',
      roles: [],
    }
  });

  useEffect(() => {
    if (open) {
      if (usuario) {
        form.reset({
          nome: usuario.nome,
          email: usuario.email,
          cpf: usuario.cpf,
          rg: usuario.rg,
          dataNascimento: usuario.dataNascimento ? usuario.dataNascimento.split('T')[0] : '',
          telefone: usuario.telefone,
          telefoneComercial: usuario.telefoneComercial || '',
          enderecoLogradouro: usuario.enderecoLogradouro,
          enderecoNumero: usuario.enderecoNumero,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          roles: usuario.roles as any,
        });
      } else {
        form.reset({
          nome: '',
          email: '',
          cpf: '',
          rg: '',
          dataNascimento: '',
          telefone: '',
          telefoneComercial: '',
          enderecoLogradouro: '',
          enderecoNumero: '',
          roles: [],
        });
      }
    }
  }, [open, usuario, form]);

  async function onSubmit(data: UsuarioFormValues) {
    try {
      if (isEditing && usuario) {
        const result = await atualizarUsuario(usuario.id, {
            ...data,
            dataNascimento: data.dataNascimento ? `${data.dataNascimento}T00:00:00.000Z` : undefined
        });
        if (result) {
            toast.success('Usuário atualizado com sucesso!');
            setOpen(false);
            if (onSuccess) onSuccess();
        }
      } else {
        const result = await criarUsuario({
            ...data,
            dataNascimento: `${data.dataNascimento}T00:00:00.000Z`
        });
        
        if (result) {
            toast.success('Usuário criado com sucesso!');
            setOpen(false);
            if (onSuccess) onSuccess();
        }
      }
    } catch (error) {
      console.error(error);
      toast.error(isEditing ? 'Erro ao atualizar usuário.' : 'Erro ao criar usuário.');
    }
  }

  async function handleToggleStatus() {
    if (!usuario) return;
    try {
      setIsToggling(true);
      if (usuario.isAtivo) {
         const success = await deletarUsuario(usuario.id);
         if (success) toast.success('Usuário desativado com sucesso!');
      } else {
         const result = await atualizarUsuario(usuario.id, { isAtivo: true });
         if (result) toast.success('Usuário ativado com sucesso!');
      }
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(usuario.isAtivo ? 'Erro ao desativar usuário.' : 'Erro ao ativar usuário.');
    } finally {
      setIsToggling(false);
    }
  }

  const handleRoleChange = (role: string, checked: boolean, currentRoles: string[], onChange: (val: string[]) => void) => {
    if (checked) {
      if (!currentRoles.includes(role)) {
        onChange([...currentRoles, role]);
      }
    } else {
      onChange(currentRoles.filter(r => r !== role));
    }
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
      <SheetContent className="w-[400px] sm:w-[600px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Atualize os dados do usuário.' : 'Cadastre um novo usuário no sistema.'}
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 px-4">
            
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                 <FormField
                    control={form.control}
                    name="dataNascimento"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="cpf"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>CPF</FormLabel>
                        <FormControl>
                            <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="rg"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>RG</FormLabel>
                        <FormControl>
                            <Input placeholder="00.000.000-0" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (Celular)</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 99999-9999" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="telefoneComercial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone Comercial</FormLabel>
                      <FormControl>
                        <Input placeholder="(11) 3333-3333" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <FormField
                        control={form.control}
                        name="enderecoLogradouro"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Endereço (Rua/Av)</FormLabel>
                            <FormControl>
                                <Input placeholder="Rua das Flores" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div>
                    <FormField
                        control={form.control}
                        name="enderecoNumero"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Número</FormLabel>
                            <FormControl>
                                <Input placeholder="123" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Perfis de Acesso</FormLabel>
                  <div className="flex flex-col gap-3 border p-4 rounded-md">
                    {[
                        { value: 'ADMIN', label: 'Administrador' },
                        { value: 'PROFESSOR', label: 'Professor' },
                        { value: 'RESPONSAVEL', label: 'Responsável' }
                    ].map((role) => (
                        <div key={role.value} className="flex items-center space-x-2">
                            <input 
                                type="checkbox"
                                id={`role-${role.value}`}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                checked={field.value.includes(role.value as any)}
                                onChange={(e) => handleRoleChange(role.value, e.target.checked, field.value, field.onChange)}
                            />
                            <label htmlFor={`role-${role.value}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                {role.label}
                            </label>
                        </div>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="flex-col sm:flex-row gap-2">
               {isEditing && (
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                        variant="outline"
                        type="button" 
                        disabled={isToggling}
                        className={usuario.isAtivo
                            ? "border-red-600 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" 
                            : "border-green-600 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"}
                    >
                       {isToggling ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            usuario.isAtivo ? <Power className="h-4 w-4 mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                       {usuario.isAtivo ? "Desativar Usuário" : "Ativar Usuário"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{usuario.isAtivo ? "Desativar Usuário?" : "Ativar Usuário?"}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {usuario.isAtivo 
                            ? <span>Esta ação irá inativar o usuário <strong>{usuario.nome}</strong>. O acesso será bloqueado temporariamente.</span>
                            : <span>Esta ação irá ativar o usuário <strong>{usuario.nome}</strong> novamente. O acesso será restaurado.</span>
                        }
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleToggleStatus} 
                         className={usuario.isAtivo ? "bg-destructive text-white hover:bg-destructive/90" : "bg-green-600 hover:bg-green-700"}
                      >
                        Confirmar {usuario.isAtivo ? "Inativação" : "Ativação"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Salvar Alterações' : 'Criar Usuário'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
