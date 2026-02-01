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
    {
      id: "cadastro-unificado",
      label: "Cadastro",
      href: "/admin/cadastro/aluno-responsavel",
      icon: UserPlus,
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
      id: "cronograma",
      label: "Cronograma Anual",
      href: "/admin/cronograma",
      icon: Clock,
    },
    {
      id: "eventos",
      label: "Eventos",
      href: "/admin/eventos",
      icon: Calendar,
    },
    {
      id: "financeiro",
      label: "Financeiro",
      href: "/admin/financeiro",
      icon: CircleDollarSign,
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
      id: "eventos",
      label: "Eventos",
      href: "/professor/eventos",
      icon: Calendar,
    },
    {
      id: "atividades",
      label: "Atividades",
      href: "/professor/atividades",
      icon: FileText,
    },
    {
      id: "alunos",
      label: "Alunos",
      href: "/professor/alunos",
      icon: GraduationCap,
    },
    {
      id: "diarios",
      label: "Diários",
      href: "/professor/diarios",
      icon: ClipboardList,
      
    },
    // {
    //   id: "calendario",
    //   label: "Calendário",
    //   href: "/calendario?section=calendario",
    //   icon: CalendarDays,
    //   divider: true,
    // },
    {
      id: "cronograma",
      label: "Cronograma Anual",
      href: "/professor/cronograma",
      icon: Clock,
    },
    // {
    //   id: "relatorios",
    //   label: "Relatórios",
    //   href: "/relatorios?section=relatorios",
    //   icon: BarChart3,
    // },
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
      label: "Eventos da Turma",
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
    // {
    //   id: "comunicados",
    //   label: "Comunicados",
    //   href: "/comunicados?section=comunicados",
    //   icon: ClipboardList,
    // },
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
