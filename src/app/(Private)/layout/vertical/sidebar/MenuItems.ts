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
}

import {
  IconHome,
  IconChartLine,
  IconPlus,
  IconList,
  IconReportAnalytics,
  IconCreditCard,
  IconReceipt,
  IconWallet,
  IconSettings,
  IconCalculator,
  IconTrendingUp,
  IconPigMoney,
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
    title: "Extrato",
    icon: IconList,
    href: "/extrato",
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
    title: "Cadastros",
    icon: IconSettings,
    href: "/cadastros",
  },
];

export default Menuitems;
