import {
  Home,
  Settings,
  Users,
  BarChart3,
  HelpCircle,
  LogOut,
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

// Itens temporários da sidebar
export const sidebarItems: SidebarItem[] = [
 {
      id: "visao-geral",
      label: "Visão Geral",
      href: "/admin/dashboard?section=visao-geral",
      icon: LayoutDashboard,
    },
    {
      id: "usuarios",
      label: "Usuários",
      href: "/admin/dashboard?section=usuarios",
      icon: Users,
    },
    {
      id: "alunos",
      label: "Alunos",
      href: "/admin/dashboard?section=alunos",
      icon: GraduationCap,
    },
    {
      id: "turmas",
      label: "Turmas",
      href: "/admin/dashboard?section=turmas",
      icon: BookOpen,
    },
    {
      id: "diarios",
      label: "Diários",
      href: "/diario",
      icon: ClipboardList,
    },
    {
      id: "atividades",
      label: "Atividades Pedagógicas",
      href: "/admin/dashboard?section=atividades",
      icon: FileText,
    },
    {
      id: "calendario",
      label: "Calendário",
      href: "/admin/dashboard?section=calendario",
      icon: CalendarDays,
      divider: true,
    },
    {
      id: "cronograma",
      label: "Cronograma Anual",
      href: "/admin/dashboard?section=cronograma",
      icon: Clock,
    },
];

// Itens da sidebar para ADMIN
export function getAdminSidebarItems(): SidebarItem[] {
  return [
    {
      id: "visao-geral",
      label: "Visão Geral",
      href: "/admin/dashboard?section=visao-geral",
      icon: LayoutDashboard,
    },
    {
      id: "usuarios",
      label: "Usuários",
      href: "/admin/dashboard?section=usuarios",
      icon: Users,
    },
    {
      id: "alunos",
      label: "Alunos",
      href: "/admin/dashboard?section=alunos",
      icon: GraduationCap,
    },
    {
      id: "turmas",
      label: "Turmas",
      href: "/admin/dashboard?section=turmas",
      icon: BookOpen,
    },
    {
      id: "diarios",
      label: "Diários",
      href: "/diario",
      icon: ClipboardList,
    },
    {
      id: "atividades",
      label: "Atividades Pedagógicas",
      href: "/admin/dashboard?section=atividades",
      icon: FileText,
    },
    {
      id: "calendario",
      label: "Calendário",
      href: "/admin/dashboard?section=calendario",
      icon: CalendarDays,
      divider: true,
    },
    {
      id: "cronograma",
      label: "Cronograma Anual",
      href: "/admin/dashboard?section=cronograma",
      icon: Clock,
    },
  ];
}

// Itens da sidebar para PROFESSOR
export function getProfessorSidebarItems(): SidebarItem[] {
  return [
    {
      id: "visao-geral",
      label: "Visão Geral",
      href: "/professor/dashboard?section=visao-geral",
      icon: LayoutDashboard,
    },
    {
      id: "minhas-turmas",
      label: "Minhas Turmas",
      href: "/professor/dashboard?section=minhas-turmas",
      icon: BookOpen,
    },
    {
      id: "atividades",
      label: "Atividades",
      href: "/professor/dashboard?section=atividades",
      icon: FileText,
    },
    {
      id: "alunos",
      label: "Alunos",
      href: "/professor/dashboard?section=alunos",
      icon: GraduationCap,
    },
    {
      id: "diarios",
      label: "Diários",
      href: "/diario",
      icon: ClipboardList,
    },
    {
      id: "calendario",
      label: "Calendário",
      href: "/professor/dashboard?section=calendario",
      icon: CalendarDays,
      divider: true,
    },
    {
      id: "cronograma",
      label: "Cronograma",
      href: "/cronograma",
      icon: Clock,
    },
    {
      id: "relatorios",
      label: "Relatórios",
      href: "/professor/dashboard?section=relatorios",
      icon: BarChart3,
    },
  ];
}

// Função para obter itens da sidebar por role
export function getSidebarItems(role: string): SidebarItem[] {
  switch (role.toUpperCase()) {
    case "ADMIN":
      return getAdminSidebarItems();
    case "PROFESSOR":
      return getProfessorSidebarItems();
    default:
      return sidebarItems;
  }
}
