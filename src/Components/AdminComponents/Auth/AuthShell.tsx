import type { ReactNode } from "react";
import { Chit, StepRow, Wordmark } from "../../rail";

/** An example ticket for the sign-in rail. Illustrative only. */
const ExampleChit = ({ table, lines, status, className }: {
  table: number;
  lines: [number, string][];
  status: "pending" | "preparing" | "ready";
  className?: string;
}) => (
  <Chit clipped className={className} innerClassName="px-4 pt-4">
    <div className="flex items-end justify-between">
      <p className="flex items-baseline gap-1 leading-none">
        <span className="text-sm font-extrabold uppercase">Table</span>
        <span className="text-4xl font-black" style={{ fontVariationSettings: '"wdth" 78' }}>{table}</span>
      </p>
      <span className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-soft">Example</span>
    </div>
    <StepRow status={status} className="pt-3" />
    <div className="perf mt-3" />
    <ul className="space-y-1 py-3 font-mono text-sm">
      {lines.map(([qty, title]) => (
        <li key={title} className="flex gap-2">
          <span className="w-7 font-bold">{qty}×</span>
          <span>{title}</span>
        </li>
      ))}
    </ul>
  </Chit>
);

const AuthShell = ({ children }: { children: ReactNode }) => (
  <div className="min-h-dvh bg-paper lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(28rem,1fr)]">
    <aside className="steel steel-ground relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
      <Wordmark className="text-paper" />
      <div className="relative">
        <div className="rail absolute inset-x-0 top-0 h-3 rounded-full" aria-hidden="true" />
        <div className="grid grid-cols-3 gap-4 pt-1" aria-hidden="true">
          <ExampleChit table={4} status="pending" lines={[[2, "Lager"], [1, "Fries"]]} className="print-in" />
          <ExampleChit table={9} status="preparing" lines={[[1, "Margherita"], [2, "Cola"], [1, "Salad"]]} className="print-in [animation-delay:120ms]" />
          <ExampleChit table={2} status="ready" lines={[[3, "Espresso"]]} className="print-in [animation-delay:240ms]" />
        </div>
      </div>
      <div className="max-w-md">
        <p className="text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-paper">
          Guests order from the table. The kitchen sees it on the rail.
        </p>
        <p className="mt-4 text-steel-300">
          One ticket, from the guest’s phone to the pass to the day’s report.
        </p>
      </div>
    </aside>
    <main className="flex min-h-dvh flex-col px-5 py-8 sm:px-10">
      <Wordmark className="text-ink lg:hidden" />
      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">{children}</div>
    </main>
  </div>
);

export default AuthShell;
