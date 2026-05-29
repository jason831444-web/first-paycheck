import Link from "next/link";
import { WalletCards } from "lucide-react";

export function Header() {
  const links = [
    { href: "/", label: "Home" },
    { href: "/simulator", label: "Simulator" },
    { href: "/scenarios", label: "Compare" },
    { href: "/affordability", label: "Rent check" },
    { href: "/apartments", label: "Apartments" },
    { href: "/offers", label: "Offers" },
    { href: "/cashflow", label: "Cashflow" },
    { href: "/goals", label: "Goals" },
    { href: "/paycheck-calendar", label: "Pay calendar" },
    { href: "/saved", label: "Saved" },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight text-slate-950">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-700 text-white shadow-sm">
            <WalletCards className="h-4 w-4" aria-hidden="true" />
          </span>
          <span>FirstPaycheck</span>
        </Link>
        <nav className="flex items-center gap-1 overflow-x-auto rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-medium text-slate-600">
          {links.map((link) => (
            <Link key={link.href} className="whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white hover:text-slate-950 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-100" href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
