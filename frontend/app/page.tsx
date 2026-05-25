import Link from "next/link";
import { Calculator, Car, Home, Landmark, MapPinned } from "lucide-react";
import { Disclaimer } from "@/components/Disclaimer";

const cards = [
  { title: "Estimate take-home pay", icon: Calculator },
  { title: "Check rent affordability", icon: Home },
  { title: "Compare NYC vs NJ", icon: MapPinned },
  { title: "Model car vs transit costs", icon: Car },
  { title: "Built for new grads and OPT workers", icon: Landmark },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">FirstPaycheck</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-6xl">
            Plan your first paycheck before you sign the lease.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Estimate take-home pay, rent pressure, transportation costs, and monthly cushion before choosing between Manhattan, Brooklyn, Jersey City, Hoboken, or a car-first NJ suburb.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/simulator" className="rounded-lg bg-teal-700 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-teal-800">
              Start Simulation
            </Link>
            <Link href="/scenarios" className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
              Compare Locations
            </Link>
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-3">
            {cards.map((card) => (
              <div key={card.title} className="flex items-center gap-3 rounded-lg border border-slate-100 p-4">
                <card.icon className="h-5 w-5 text-teal-700" />
                <span className="font-medium text-slate-800">{card.title}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="mt-10">
        <Disclaimer />
      </div>
    </main>
  );
}
