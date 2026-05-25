import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950">
          FirstPaycheck
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/simulator">
            Simulator
          </Link>
          <Link className="rounded-md px-3 py-2 hover:bg-slate-100" href="/scenarios">
            Scenarios
          </Link>
        </nav>
      </div>
    </header>
  );
}
