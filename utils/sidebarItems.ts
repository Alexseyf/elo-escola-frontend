import {
  Users,
  BarChart3,
  LucideIcon,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  CalendarDays,
  ClipboardList,
  FileText,
  Clock,
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
      id: "visao-geral",
      label: "Visão Geral",
      href: "/visao-geral?section=visao-geral",
      icon: LayoutDashboard,
    },
    {
      id: "usuarios",
      label: "Usuários",
      href: "/usuarios?section=usuarios",
      icon: Users,
    },
    {
      id: "alunos",
      label: "Alunos",
      href: "/alunos?section=alunos",
      icon: GraduationCap,
    },
    {
      id: "turmas",
      label: "Turmas",
      href: "/turmas?section=turmas",
      icon: BookOpen,
    },
    {
      id: "diarios",
      label: "Diários",
      href: "/diario?section=diarios",
      icon: ClipboardList,
    },
    {
      id: "atividades",
      label: "Atividades Pedagógicas",
      href: "/atividades?section=atividades",
      icon: FileText,
    },
    {
      id: "calendario",
      label: "Calendário",
      href: "/calendario?section=calendario",
      icon: CalendarDays,
      divider: true,
    },
    {
      id: "cronograma",
      label: "Cronograma Anual",
      href: "/cronograma?section=cronograma",
      icon: Clock,
    },
        {
      id: "relatorios",
      label: "Relatórios",
      href: "/relatorios?section=relatorios",
      icon: BarChart3,
    },
  ];
}

// PROFESSOR
export function getProfessorSidebarItems(): SidebarItem[] {
  return [
    {
      id: "visao-geral",
      label: "Visão Geral",
      href: "/visao-geral?section=visao-geral",
      icon: LayoutDashboard,
    },
    {
      id: "minhas-turmas",
      label: "Minhas Turmas",
      href: "/minhas-turmas?section=minhas-turmas",
      icon: BookOpen,
    },
    {
      id: "atividades",
      label: "Atividades",
      href: "/atividades?section=atividades",
      icon: FileText,
    },
    {
      id: "alunos",
      label: "Alunos",
      href: "/alunos?section=alunos",
      icon: GraduationCap,
    },
    {
      id: "diarios",
      label: "Diários",
      href: "/diario?section=diarios",
      icon: ClipboardList,
      
    },
    {
      id: "calendario",
      label: "Calendário",
      href: "/calendario?section=calendario",
      icon: CalendarDays,
      divider: true,
    },
    {
      id: "cronograma",
      label: "Cronograma",
      href: "/cronograma?section=cronograma",
      icon: Clock,
    },
    {
      id: "relatorios",
      label: "Relatórios",
      href: "/relatorios?section=relatorios",
      icon: BarChart3,
    },
  ];
}

// RESPONSAVEL
export function getResponsavelSidebarItems(): SidebarItem[] {
  return [
    {
      id: "visao-geral",
      label: "Visão Geral",
      href: "/visao-geral?section=visao-geral",
      icon: LayoutDashboard,
    },
    {
      id: "meus-filhos",
      label: "Meus Filhos",
      href: "/meus-filhos?section=meus-filhos",
      icon: Users,
    },
    {
      id: "comunicados",
      label: "Comunicados",
      href: "/comunicados?section=comunicados",
      icon: ClipboardList,
    },
    {
      id: "calendario",
      label: "Calendário",
      href: "/calendario?section=calendario",
      icon: CalendarDays,
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
    default:
      return [];
  }
}
