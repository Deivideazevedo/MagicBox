// Notifications dropdown - replaced with financial notifications
import { ROUTES } from "@/constants/routes";

interface notificationType {
  avatar: string;
  title: string;
  subtitle: string;
}

const notifications: notificationType[] = [
  {
    avatar: "/images/profile/user-10.jpg",
    title: "Novo lançamento registrado!",
    subtitle: "Pagamento de R$ 250,00 processado",
  },
  {
    avatar: "/images/profile/user-2.jpg",
    title: "Meta financeira atingida",
    subtitle: "Parabéns! Você economizou R$ 500 este mês",
  },
  {
    avatar: "/images/profile/user-3.jpg",
    title: "Conta a vencer",
    subtitle: "Luz vence em 3 dias - R$ 185,90",
  },
  {
    avatar: "/images/profile/user-4.jpg",
    title: "Relatório mensal disponível",
    subtitle: "Confira seu resumo financeiro",
  },
];

//
// Profile dropdown - using proper routes
//
interface ProfileType {
  href: string;
  title: string;
  subtitle: string;
  icon: any;
}
const profile: ProfileType[] = [
  {
    href: ROUTES.DASHBOARD.PERFIL,
    title: "Meu Perfil",
    subtitle: "Configurações da conta",
    icon: "/images/svgs/icon-account.svg",
  },
  {
    href: ROUTES.DASHBOARD.EXTRATO,
    title: "Meu Extrato",
    subtitle: "Histórico de transações",
    icon: "/images/svgs/icon-inbox.svg",
  },
  {
    href: ROUTES.DASHBOARD.RELATORIOS,
    title: "Meus Relatórios",
    subtitle: "Análises financeiras",
    icon: "/images/svgs/icon-tasks.svg",
  },
];

// apps dropdown - financial tools instead of generic apps

interface appsLinkType {
  href: string;
  title: string;
  subtext: string;
  avatar: string;
}

const appsLink: appsLinkType[] = [
  {
    href: ROUTES.DASHBOARD.LANCAMENTOS,
    title: "Lançamentos",
    subtext: "Registrar novas transações",
    avatar: "/images/svgs/icon-dd-chat.svg",
  },
  {
    href: ROUTES.DASHBOARD.EXTRATO,
    title: "Extrato Financeiro",
    subtext: "Visualizar histórico",
    avatar: "/images/svgs/icon-dd-cart.svg",
  },
  {
    href: ROUTES.DASHBOARD.CADASTROS,
    title: "Cadastros",
    subtext: "Gerenciar contas e categorias",
    avatar: "/images/svgs/icon-dd-invoice.svg",
  },
  {
    href: ROUTES.DASHBOARD.RELATORIOS,
    title: "Relatórios",
    subtext: "Análises e gráficos",
    avatar: "/images/svgs/icon-dd-date.svg",
  },
];

interface LinkType {
  href: string;
  title: string;
}

const pageLinks: LinkType[] = [
  {
    href: ROUTES.DASHBOARD.HOME,
    title: "Dashboard Principal",
  },
  {
    href: ROUTES.DASHBOARD.LANCAMENTOS,
    title: "Novo Lançamento",
  },
  {
    href: ROUTES.DASHBOARD.EXTRATO,
    title: "Consultar Extrato",
  },
  {
    href: ROUTES.DASHBOARD.RELATORIOS,
    title: "Relatórios Financeiros",
  },
  {
    href: ROUTES.DASHBOARD.CADASTROS,
    title: "Configurações",
  },
];

export { notifications, profile, pageLinks, appsLink };
