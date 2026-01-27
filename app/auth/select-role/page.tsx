"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, GraduationCap, Users, LayoutGrid } from "lucide-react";
import { SplashScreen } from "@/components/ui/splash-screen";
import { toast } from "sonner";

const roleConfig: Record<string, { label: string; description: string; icon: any; color: string; path: string }> = {
    PLATFORM_ADMIN: {
        label: "Administrador da Plataforma",
        description: "Gerenciar todas as escolas e configurações globais",
        icon: LayoutGrid,
        color: "bg-purple-100 text-purple-600",
        path: "/platform/escolas",
    },
    ADMIN: {
        label: "Administrador da Escola",
        description: "Gerenciar usuários, turmas e dados da escola",
        icon: Shield,
        color: "bg-blue-100 text-blue-600",
        path: "/admin/dashboard",
    },
    PROFESSOR: {
        label: "Professor",
        description: "Lançar diários, gerenciar atividades e acompanhar alunos",
        icon: GraduationCap,
        color: "bg-green-100 text-green-600",
        path: "/professor/dashboard",
    },
    RESPONSAVEL: {
        label: "Responsável",
        description: "Acompanhar o desempenho e rotina dos filhos",
        icon: Users,
        color: "bg-orange-100 text-orange-600",
        path: "/responsavel/dashboard",
    },
};

export default function SelectRolePage() {
    const router = useRouter();
    const { user, setActiveRole, isAuthenticated, _hasHydrated } = useAuthStore();
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (!_hasHydrated) return;
        if (!isAuthenticated || !user) {
            router.push("/login");
        }
    }, [_hasHydrated, isAuthenticated, user, router]);

    if (!_hasHydrated || !user) return <SplashScreen />;

    const handleSelectRole = (role: string) => {
        setIsRedirecting(true);
        setActiveRole(role);

        toast.success(`Entrando como ${roleConfig[role]?.label || role}`);

        setTimeout(() => {
            router.push(roleConfig[role].path);
        }, 800);
    };

    return (
        <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Olá, {user.nome.split(' ')[0]}!</h1>
                    <p className="text-neutral-500 text-lg">Como você deseja acessar o sistema hoje?</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                    {user.roles.map((role) => {
                        const config = roleConfig[role] || {
                            label: role,
                            description: "Acessar sistema",
                            icon: Shield,
                            color: "bg-gray-100 text-gray-600",
                            path: "/"
                        };
                        const Icon = config.icon;

                        return (
                            <div
                                key={role}
                                className="transition-transform active:scale-95"
                            >
                                <Card
                                    className="cursor-pointer border-2 hover:border-blue-500 transition-all shadow-md hover:shadow-xl overflow-hidden group relative"
                                    onClick={() => !isRedirecting && handleSelectRole(role)}
                                >
                                    <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                                        <div className={`p-4 rounded-full ${config.color} group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                                                {config.label}
                                            </CardTitle>
                                            <CardDescription>
                                                {config.description}
                                            </CardDescription>
                                        </div>
                                        {isRedirecting && (
                                            <div className="absolute inset-0 bg-white/50 flex items-center justify-center backdrop-blur-[2px]">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={() => useAuthStore.getState().logout()}
                    className="text-sm text-neutral-500 hover:text-red-500 hover:underline transition-colors"
                >
                    Sair da conta
                </button>
            </div>
        </div>
    );
}
