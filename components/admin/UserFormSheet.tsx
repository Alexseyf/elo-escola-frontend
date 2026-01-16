import { useState, useEffect } from 'react';
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
      form.reset();
    }
  }, [open, form]);

  async function onSubmit(data: UsuarioFormValues) {
    try {
      const result = await criarUsuario({
        ...data,
        dataNascimento: `${data.dataNascimento}T00:00:00.000Z`
      });
      
      if (result) {
        toast.success('Usuário criado com sucesso!');
        setOpen(false);
        form.reset();
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao criar usuário.');
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
          <SheetTitle>Novo Usuário</SheetTitle>
          <SheetDescription>
            Cadastre um novo usuário no sistema. Preencha todos os campos obrigatórios.
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 px-1">
            
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
