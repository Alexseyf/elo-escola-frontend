import {
  Users,
  LucideIcon,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  ClipboardList,
  FileText,
  Clock,
  Building2,
  UserPlus,
  CircleDollarSign,
  Calendar,
  CheckSquare,
  ScrollText,
} from "lucide-react";

export interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: number;
  divider?: boolean;
}

// ADMIN
export function getAdminSidebarItems(): SidebarItem[] {
  return [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "cadastro-unificado",
      label: "Cadastro",
      href: "/admin/cadastro/aluno-responsavel",
      icon: UserPlus,
    },
    {
      id: "usuarios",
      label: "Usuários",
      href: "/admin/usuarios",
      icon: Users,
    },
    {
      id: "alunos",
      label: "Alunos",
      href: "/admin/alunos",
      icon: GraduationCap,
    },
    {
      id: "turmas",
      label: "Turmas",
      href: "/admin/turmas",
      icon: BookOpen,
    },
    // {
    //   id: "diarios",
    //   label: "Diários",
    //   href: "/diario?section=diarios",
    //   icon: ClipboardList,
    // },
    {
      id: "atividades",
      label: "Atividades Pedagógicas",
      href: "/admin/atividades",
      icon: FileText,
    },
    {
      id: "relatorios",
      label: "Diários de Classe",
      href: "/admin/relatorios",
      icon: FileText,
    },
    {
      id: "eventos",
      label: "Avisos",
      href: "/admin/eventos",
      icon: Calendar,
    },
    {
      id: "cronograma",
      label: "Cronograma Anual",
      href: "/admin/cronograma",
      icon: Clock,
    },
    {
      id: "financeiro",
      label: "Financeiro",
      href: "/admin/financeiro",
      icon: CircleDollarSign,
    },
    {
      id: "logs",
      label: "Logs do Sistema",
      href: "/admin/logs",
      icon: ScrollText,
    },
  ];
}

// PROFESSOR
export function getProfessorSidebarItems(): SidebarItem[] {
  return [
    {
      id: "visao-geral",
      label: "Visão Geral",
      href: "/professor/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "minhas-turmas",
      label: "Minhas Turmas",
      href: "/professor/turmas",
      icon: BookOpen,
    },
    {
      id: "alunos",
      label: "Alunos",
      href: "/professor/alunos",
      icon: GraduationCap,
    },
    {
      id: "chamada",
      label: "Chamada",
      href: "/professor/chamada",
      icon: CheckSquare,
    },
    {
      id: "atividades",
      label: "Atividades Pedagógicas",
      href: "/professor/atividades",
      icon: FileText,
    },
    {
      id: "diarios",
      label: "Diários dos Alunos",
      href: "/professor/diarios",
      icon: ClipboardList,
    },
    {
      id: "relatorios",
      label: "Diários de Classe",
      href: "/professor/relatorios",
      icon: FileText,
    },
    {
      id: "eventos",
      label: "Avisos da Turma",
      href: "/professor/eventos",
      icon: Calendar,
    },
    {
      id: "cronograma",
      label: "Cronograma Anual",
      href: "/professor/cronograma",
      icon: Clock,
    },
  ];
}

// RESPONSAVEL
export function getResponsavelSidebarItems(): SidebarItem[] {
  return [
    {
      id: "visao-geral",
      label: "Visão Geral",
      href: "/responsavel/dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "meus-filhos",
      label: "Meus Filhos",
      href: "/responsavel/meus-filhos",
      icon: Users,
    },
    {
      id: "eventos",
      label: "Avisos da Turma",
      href: "/responsavel/eventos",
      icon: Calendar,
    },
    {
      id: "diarios",
      label: "Diários",
      href: "/responsavel/diarios",
      icon: FileText,
    },
    {
      id: "atividades",
      label: "Atividades Pedagógicas",
      href: "/responsavel/atividades",
      icon: ClipboardList,
    },
    {
      id: "cronograma",
      label: "Cronograma Anual",
      href: "/responsavel/cronograma",
      icon: Clock,
    },
  ];
}

// PLATFORM_ADMIN
export function getPlatformAdminSidebarItems(): SidebarItem[] {
  return [
    {
      id: "platform-home",
      label: "Dashboard",
      href: "/platform",
      icon: LayoutDashboard,
    },
    {
      id: "platform-escolas",
      label: "Escolas",
      href: "/platform/escolas",
      icon: Building2,
    },
    {
      id: "platform-bncc",
      label: "BNCC",
      href: "/platform/bncc",
      icon: BookOpen,
    },
  ];
}

export function getSidebarItems(role: string): SidebarItem[] {
  switch (role.toUpperCase()) {
    case "ADMIN":
      return getAdminSidebarItems();
    case "PROFESSOR":
      return getProfessorSidebarItems();
    case "RESPONSAVEL":
      return getResponsavelSidebarItems();
    case "PLATFORM_ADMIN":
      return getPlatformAdminSidebarItems();
    default:
      return [];
  }
}
