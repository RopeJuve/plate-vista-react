import { useEffect, useState } from "react";
import { fetchBill } from "../../shared/api/bill";
import { formatCents } from "../../shared/money/formatCents";
import type { ClosedSession, SessionBill } from "../../shared/realtime/protocol";
import { ORDER_STATUS_LABEL } from "../../shared/realtime/protocol";
import { billedLines } from "../../shared/realtime/tickets";
import { clockTime } from "../../services/time";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const BillDialog = ({ entry, onClose }: { entry: ClosedSession | null; onClose: () => void }) => {
  const [bill, setBill] = useState<SessionBill | null>(null);
  const [error, setError] = useState("");
  const sessionId = entry?._id;

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    let cancelled = false;
    setBill(null);
    setError("");
    fetchBill(sessionId)
      .then((next) => {
        if (!cancelled) {
          setBill(next);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Could not load this bill.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  return (
    <Dialog open={Boolean(entry)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Table {entry?.tableNumber ?? "–"} bill</DialogTitle>
          <DialogDescription>
            {entry ? `Open ${clockTime(entry.openedAt)} – closed ${clockTime(entry.closedAt)}` : ""}
          </DialogDescription>
        </DialogHeader>
        {error && (
          <p className="text-sm font-semibold text-alert-ink" role="alert">
            {error}
          </p>
        )}
        {!bill && !error && <p className="text-sm text-ink-soft">Loading…</p>}
        {bill && (
          <div className="max-h-[60dvh] space-y-4 overflow-y-auto">
            {bill.orders.length === 0 && <p className="text-sm text-ink-soft">Nothing was ordered.</p>}
            {bill.orders.map((order) => (
              <section key={order._id} aria-label={`Order at ${clockTime(order.createdAt)}`}>
                <p className="mb-1 font-mono text-xs uppercase tracking-[0.1em] text-ink-soft">
                  {clockTime(order.createdAt)} · {ORDER_STATUS_LABEL[order.status]}
                </p>
                <ul className="space-y-1 text-sm">
                  {billedLines(order).map((item, index) => (
                    <li key={`${item.productId}:${index}`} className="flex items-baseline gap-2">
                      <span className="font-mono tabular text-ink-soft">{item.quantity}×</span>
                      <span className="min-w-0 flex-1 truncate">{item.title}</span>
                      <span className="font-mono tabular">{formatCents(item.lineTotalCents)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <div className="flex items-baseline gap-2 border-t border-ink/10 pt-3 font-mono">
              <span className="text-sm font-bold uppercase tracking-[0.1em]">Total</span>
              <span className="leader" aria-hidden="true" />
              <span className="text-lg font-bold tabular">{formatCents(bill.totalCents)}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/** Tables closed in the last 12 hours. Their orders load from the bill endpoint on click. */
const RecentlyClosed = ({ entries }: { entries: ClosedSession[] }) => {
  const [selected, setSelected] = useState<ClosedSession | null>(null);

  if (entries.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="closed-title" className="mt-10">
      <h2 id="closed-title" className="mb-3 text-lg font-extrabold tracking-[-0.01em] text-paper">
        Recently closed
      </h2>
      <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-xl bg-steel-850/60">
        {entries.map((entry) => (
          <li key={entry._id}>
            <button
              type="button"
              onClick={() => setSelected(entry)}
              className="flex w-full items-baseline gap-4 px-4 py-3 text-left text-steel-300 transition-colors hover:bg-white/[0.04] hover:text-paper"
              aria-label={`Show bill for table ${entry.tableNumber ?? ""}, closed ${clockTime(entry.closedAt)}`}
            >
              <span className="w-16 text-base font-black text-paper">T{entry.tableNumber ?? "–"}</span>
              <span className="font-mono text-sm tabular">
                {clockTime(entry.openedAt)} – {clockTime(entry.closedAt)}
              </span>
              <span className="ml-auto font-mono text-sm font-bold tabular text-paper">
                {formatCents(entry.totalCents)}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <BillDialog entry={selected} onClose={() => setSelected(null)} />
    </section>
  );
};

export default RecentlyClosed;
