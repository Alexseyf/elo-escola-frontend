import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createSchoolSchema, updateSchoolSchema, CreateSchoolFormValues } from '@/schemas/escola';
import { createSchool, updateSchool, deleteSchool } from '@/utils/escolas';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter,
  SheetTrigger
} from '../../ui/sheet';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
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

interface SchoolData {
  id: number;
  name: string;
  slug: string;
  email?: string;
  legalName?: string;
  cnpj?: string;
  logoUrl?: string;
  primaryColor?: string;
  timezone?: string;
  subscriptionPlan: "BASIC" | "PRO" | "PREMIUM" | string;
  active: boolean;
}

interface SchoolFormSheetProps {
  school?: SchoolData;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

export function SchoolFormSheet({ school, onSuccess, trigger }: SchoolFormSheetProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  
  const isEditing = !!school;

  const form = useForm<CreateSchoolFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(isEditing ? updateSchoolSchema : createSchoolSchema) as any,
    defaultValues: {
      name: '',
      slug: '',
      email: '',
      legalName: '',
      cnpj: '',
      logoUrl: '',
      primaryColor: '#000000',
      timezone: 'America/Sao_Paulo',
      subscriptionPlan: 'BASIC',
      adminUser: {
        nome: '',
        email: '',
        telefone: ''
      }
    }
  });

  useEffect(() => {
    if (open) {
      if (school) {
        form.reset({
          name: school.name,
          slug: school.slug,
          email: school.email || '',
          legalName: school.legalName || '',
          cnpj: school.cnpj || '',
          logoUrl: school.logoUrl || '',
          primaryColor: school.primaryColor || '#000000',
          timezone: school.timezone || 'America/Sao_Paulo',
          subscriptionPlan: school.subscriptionPlan as "BASIC" | "PRO" | "PREMIUM",
        });
      } else {
        form.reset({
          name: '',
          slug: '',
          email: '',
          legalName: '',
          cnpj: '',
          logoUrl: '',
          primaryColor: '#000000',
          timezone: 'America/Sao_Paulo',
          subscriptionPlan: 'BASIC',
          adminUser: { nome: '', email: '', telefone: '' }
        });
      }
    }
  }, [open, school, form]);

  const { watch, setValue } = form;
  const nameValue = watch('name');

  useEffect(() => {
    if (!isEditing && nameValue && !form.getFieldState('slug').isDirty) {
      const slug = nameValue
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setValue('slug', slug);
    }
  }, [nameValue, setValue, form, isEditing]);

  async function onSubmit(data: CreateSchoolFormValues) {
    try {
      setIsSubmitting(true);
      
      if (isEditing && school) {
        await updateSchool(school.id, data);
        toast.success('Escola atualizada com sucesso!');
      } else {
        await createSchool(data);
        toast.success('Escola criada com sucesso!');
      }
      
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { status: number } };
      if (err.response?.status === 409) {
        toast.error('Já existe uma escola com esse Slug ou Email de administrador.');
      } else {
        toast.error(isEditing ? 'Erro ao atualizar escola.' : 'Erro ao criar escola.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleStatus() {
    if (!school) return;
    try {
      setIsToggling(true);
      if (school.active) {
         await deleteSchool(school.id);
         toast.success('Escola desativada com sucesso!');
      } else {
         await updateSchool(school.id, { active: true });
         toast.success('Escola ativada com sucesso!');
      }
      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(school.active ? 'Erro ao desativar escola.' : 'Erro ao ativar escola.');
    } finally {
      setIsToggling(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Escola
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Editar Escola' : 'Nova Escola'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Atualize os dados da escola.' : 'Cadastre uma nova escola no sistema.'}
          </SheetDescription>
        </SheetHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4 px-2">
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">Dados da Escola</h3>
              
              <FormField
                control={form.control}
                name="name"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Nome da Escola</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Escola Futuro" {...field} value={field.value as string} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Email da Escola</FormLabel>
                    <FormControl>
                      <Input placeholder="contato@escola.com.br" {...field} value={field.value as string} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>Slug (URL)</FormLabel>
                    <FormControl>
                      <Input placeholder="escola-futuro" {...field} value={field.value as string} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cnpj"
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                render={({ field }: { field: any }) => (
                  <FormItem>
                    <FormLabel>CNPJ (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Apenas números" {...field} value={field.value as string} maxLength={14} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

               <div className="grid grid-cols-2 gap-4">
                 <FormField
                  control={form.control}
                  name="subscriptionPlan"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Plano</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value as string}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um plano" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="BASIC">Basic</SelectItem>
                          <SelectItem value="PRO">Pro</SelectItem>
                          <SelectItem value="PREMIUM">Premium</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="primaryColor"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Cor Primária</FormLabel>
                        <div className="flex gap-2">
                          <Input 
                            type="color" 
                            className="w-12 p-1" 
                            value={field.value as string} 
                            onChange={field.onChange} 
                          />
                          <FormControl>
                            <Input placeholder="#000000" {...field} value={field.value as string} />
                          </FormControl>
                        </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                </div>
            </div>

            {!isEditing && (
              <div className="space-y-4">
                 <h3 className="text-sm font-medium text-muted-foreground border-b pb-1">Administrador Inicial</h3>
                 
                 <FormField
                  control={form.control}
                  name="adminUser.nome"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Nome do Administrador</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} value={field.value as string} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                   <FormField
                    control={form.control}
                    name="adminUser.email"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="admin@escola.com" {...field} value={field.value as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="adminUser.telefone"
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 00000-0000" {...field} value={field.value as string} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <SheetFooter className="flex-col sm:flex-row gap-2">
              {isEditing && (
                 <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                        variant="outline" 
                        type="button" 
                        disabled={isToggling}
                        className={school.active 
                            ? "border-red-600 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" 
                            : "border-green-600 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"}
                    >
                       {isToggling ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            school.active ? <Power className="h-4 w-4 mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />
                        )}
                       {school.active ? "Desativar Escola" : "Ativar Escola"}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>{school.active ? "Desativar Escola?" : "Ativar Escola?"}</AlertDialogTitle>
                      <AlertDialogDescription>
                        {school.active 
                            ? <span>Esta ação irá inativar a escola <strong>{school.name}</strong>. O acesso será bloqueado temporariamente.</span>
                            : <span>Esta ação irá ativar a escola <strong>{school.name}</strong> novamente. O acesso será restaurado.</span>
                        }
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleToggleStatus} 
                        className={school.active ? "bg-destructive text-white hover:bg-destructive/90" : "bg-green-600 hover:bg-green-700"}
                      >
                        Confirmar {school.active ? "Inativação" : "Ativação"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Salvar Alterações' : 'Criar Escola'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
