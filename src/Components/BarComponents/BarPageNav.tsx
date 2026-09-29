import { LayoutGrid, ReceiptText } from "lucide-react";
import { Link } from "react-router-dom";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import { Lamp, Wordmark } from "../rail";
import StaffChip from "./StaffChip";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "dineIn", label: "Dine In", icon: LayoutGrid },
  { id: "orders", label: "Orders", icon: ReceiptText },
] as const;

const BarPageNav = ({
  selected,
  setSelected,
  counts,
}: {
  selected: string;
  setSelected: (tab: string) => void;
  counts?: Partial<Record<(typeof TABS)[number]["id"], number>>;
}) => {
  const { status } = useRealtime();
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-steel-950/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1920px] flex-wrap items-center gap-x-4 gap-y-2 px-3 py-2 sm:px-5">
        <Link to="/bar" className="rounded-md text-paper" aria-label="Plate Vista board">
          <Wordmark className="hidden sm:inline-flex" />
          <Wordmark compact className="sm:hidden" />
        </Link>
        <Lamp status={status} className="text-steel-300" />
        <div
          role="tablist"
          aria-label="Board view"
          className="order-last flex w-full rounded-lg bg-steel-800 p-1 sm:order-none sm:ml-4 sm:w-auto"
        >
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = selected === id;
            const count = counts?.[id];
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelected(id)}
                className={cn(
                  "flex h-10 flex-1 items-center justify-center gap-2 rounded-md px-4 text-sm font-bold transition-colors sm:flex-none",
                  active ? "bg-paper text-ink shadow-sm" : "text-steel-300 hover:text-paper"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
                {count ? (
                  <span
                    className={cn(
                      "min-w-[1.5rem] rounded-full px-1.5 font-mono text-xs tabular",
                      active ? "bg-signal text-ink" : "bg-white/10 text-paper"
                    )}
                    aria-label={`${count} open`}
                  >
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="ml-auto">
          <StaffChip />
        </div>
      </div>
    </header>
  );
};

export default BarPageNav;
