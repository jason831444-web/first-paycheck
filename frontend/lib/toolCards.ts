import {
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Goal,
  Home,
  MapPinned,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

export interface ToolCard {
  title: string;
  description: string;
  href: string;
  cta: string;
  category: string;
  icon: LucideIcon;
}

export const planningToolCards: ToolCard[] = [
  {
    title: "Apartment comparison",
    description: "Compare rent, move-in cash, cost per square foot, and monthly leftover across real apartment options.",
    href: "/apartments",
    cta: "Compare apartments",
    category: "Housing",
    icon: Home,
  },
  {
    title: "Job offer comparison",
    description: "Compare salary offers by take-home pay, rent, transportation, and real monthly leftover.",
    href: "/offers",
    cta: "Compare offers",
    category: "Career",
    icon: BriefcaseBusiness,
  },
  {
    title: "First 90 days cashflow",
    description: "Stress-test your first three months after starting a new job.",
    href: "/cashflow",
    cta: "Plan cashflow",
    category: "Cashflow",
    icon: WalletCards,
  },
  {
    title: "Budget goal calculator",
    description: "Start with a savings goal and calculate your max rent or spending limits.",
    href: "/goals",
    cta: "Calculate goals",
    category: "Goals",
    icon: Goal,
  },
  {
    title: "Paycheck calendar",
    description: "Plan around rent, recurring bills, and two-paycheck or three-paycheck months.",
    href: "/paycheck-calendar",
    cta: "Build calendar",
    category: "Timing",
    icon: CalendarClock,
  },
  {
    title: "Apartment affordability check",
    description: "Quickly check whether a specific apartment fits your estimated take-home pay.",
    href: "/affordability",
    cta: "Check rent",
    category: "Housing",
    icon: Building2,
  },
  {
    title: "City comparison",
    description: "Compare how your salary stretches across major U.S. cities.",
    href: "/scenarios",
    cta: "Compare cities",
    category: "Location",
    icon: MapPinned,
  },
];
