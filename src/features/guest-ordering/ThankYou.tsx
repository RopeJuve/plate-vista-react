import { useEffect, useState } from "react";
import { Chit, Wordmark } from "../../Components/rail";
import { fetchBill } from "../../shared/api/bill";
import { formatCents } from "../../shared/money/formatCents";
import type { SessionBill } from "../../shared/realtime/protocol";
import { useGuestAuth } from "./GuestAuthContext";

/** Every line the guest ordered, merged by product, from the server's bill. */
const billLines = (bill: SessionBill) => {
  const lines = new Map<string, { title: string; quantity: number; totalCents: number }>();
  bill.orders.forEach((order) => {
    order.items.forEach((item) => {
      const key = `${item.productId}:${item.unitPriceCents}`;
      const line = lines.get(key) ?? { title: item.title, quantity: 0, totalCents: 0 };
      line.quantity += item.quantity;
      line.totalCents += item.lineTotalCents;
      lines.set(key, line);
    });
  });
  return [...lines.values()];
};

export const ThankYou = ({ sessionId }: { sessionId?: string }) => {
  const { session } = useGuestAuth();
  const token = session?.token;
  const [bill, setBill] = useState<SessionBill | null>(null);

  useEffect(() => {
    if (!sessionId || !token) {
      return;
    }
    let cancelled = false;
    fetchBill(sessionId, token)
      .then((next) => {
        if (!cancelled) {
          setBill(next);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [sessionId, token]);

  const lines = bill ? billLines(bill) : [];

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-paper px-6 py-12 text-ink">
      <Wordmark className="mb-8 text-ink" />
      <Chit printed lift="paper" className="w-full max-w-sm" innerClassName="bg-white px-6 pt-8 text-center">
        <h1 className="text-4xl font-black tracking-[-0.03em]">Thank you</h1>
        <div className="perf my-5" />
        <p className="text-ink-soft">This table is closed. Ask the staff if you need anything else.</p>
        {bill && lines.length > 0 && (
          <section aria-label="Your bill" className="mt-6 text-left">
            <ul className="space-y-1.5 text-sm">
              {lines.map((line) => (
                <li key={`${line.title}:${line.totalCents}`} className="flex items-baseline gap-2">
                  <span className="font-mono tabular text-ink-soft">{line.quantity}×</span>
                  <span className="min-w-0 flex-1 truncate">{line.title}</span>
                  <span className="font-mono tabular">{formatCents(line.totalCents)}</span>
                </li>
              ))}
            </ul>
            <div className="perf my-3" />
            <p className="flex items-baseline justify-between font-bold">
              <span>Total</span>
              <span className="font-mono text-lg tabular">{formatCents(bill.totalCents)}</span>
            </p>
          </section>
        )}
        <p className="mt-6 pb-2 font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">Check closed</p>
      </Chit>
    </div>
  );
};
