import { uniqueId } from "lodash";

interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
  permissions?: string[];
}

import {
  IconHome,
  IconList,
  IconPlus,
  IconReportAnalytics,
  IconSettings,
  IconUser,
  IconTarget,
  IconCreditCard
} from "@tabler/icons-react";

const Menuitems: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: "Visão Geral",
  },
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconHome,
    href: "/dashboard",
    chip: "Principal",
    chipColor: "primary",
  },

  {
    navlabel: true,
    subheader: "Gestão Financeira",
  },
  {
    id: uniqueId(),
    title: "Lançamentos",
    icon: IconPlus,
    href: "/lancamentos",
    chip: "Novo",
    chipColor: "success",
  },
  {
    id: uniqueId(),
    title: "Dívidas",
    icon: IconCreditCard,
    href: "/cadastros/dividas",
  },
  {
    id: uniqueId(),
    title: "Metas",
    icon: IconTarget,
    href: "/cadastros/metas",
  },
  {
    id: uniqueId(),
    title: "Resumo",
    icon: IconList,
    href: "/resumo",
  },
  {
    id: uniqueId(),
    title: "Relatórios",
    icon: IconReportAnalytics,
    href: "/relatorios",
  },

  {
    navlabel: true,
    subheader: "Configurações",
  },
  {
    id: uniqueId(),
    title: "Usuários",
    icon: IconUser,
    href: "/usuarios",
    permissions: ["admin"],
  },
  {
    id: uniqueId(),
    title: "Cadastros",
    icon: IconSettings,
    href: "/cadastros",
  },
];

export default Menuitems;
