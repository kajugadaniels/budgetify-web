import {
  DashboardIcon,
  ExpensesIcon,
  IncomeIcon,
  ProfileIcon,
  TodosIcon,
} from "./nav-icons";

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    icon: <DashboardIcon />,
  },
  {
    href: "/income",
    label: "Income",
    shortLabel: "Income",
    icon: <IncomeIcon />,
  },
  {
    href: "/expenses",
    label: "Expenses",
    shortLabel: "Expenses",
    icon: <ExpensesIcon />,
  },
  {
    href: "/todos",
    label: "Todos",
    shortLabel: "Todos",
    icon: <TodosIcon />,
  },
  {
    href: "/profile",
    label: "Profile",
    shortLabel: "Profile",
    icon: <ProfileIcon />,
  },
];
