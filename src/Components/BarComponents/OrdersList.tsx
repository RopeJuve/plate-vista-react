import { useState } from "react";
import { ChefHat, Layers, RefreshCw, Wine } from "lucide-react";
import BarOrders from "./BarOrders";
import { BOARD_LANES } from "../../features/staff-board/boardLanes";
import { useStaffBoard } from "../../features/staff-board/StaffBoardProvider";
import type { Station } from "../../shared/realtime/protocol";
import { cn } from "@/lib/utils";

const STATIONS = [
  { id: "all", label: "All stations", icon: Layers },
  { id: "kitchen", label: "Kitchen", icon: ChefHat },
  { id: "bar", label: "Bar", icon: Wine },
] as const;

/** The order rail: one lane per stage, filtered to a station. */
const OrdersList = () => {
  const { snapshotFailed, reload } = useStaffBoard();
  // Start on every station: items default to "kitchen", so a bar login filtered
  // to "bar" saw an empty rail. Staff narrow it with the chips.
  const [station, setStation] = useState<Station | "all">("all");

  return (
    <section aria-label="Order rail" className="flex min-h-0 flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-[1920px] flex-wrap items-center justify-between gap-3 px-3 pt-4 sm:px-5">
        <div role="radiogroup" aria-label="Station" className="flex gap-1.5">
          {STATIONS.map(({ id, label, icon: Icon }) => {
            const active = station === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setStation(id)}
                className={cn(
                  "flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors",
                  active
                    ? "border-paper bg-paper text-ink"
                    : "border-steel-700 text-steel-300 hover:border-steel-500 hover:text-paper"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </div>
        <p className="hidden font-mono text-xs uppercase tracking-[0.14em] text-steel-300 md:block">
          Oldest first · bump to move on
        </p>
      </div>

      {snapshotFailed && (
        <div
          className="mx-3 mt-3 flex flex-wrap items-center gap-3 rounded-lg bg-amber px-4 py-2.5 text-sm font-semibold text-ink sm:mx-5"
          role="alert"
        >
          <span>Could not load the board. Orders may be missing — retrying…</span>
          <button
            type="button"
            className="ml-auto inline-flex h-9 items-center gap-2 rounded-md bg-ink px-3 text-paper"
            onClick={() => void reload()}
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Retry now
          </button>
        </div>
      )}

      <div className="mx-auto grid min-h-0 w-full max-w-[1920px] flex-1 snap-x snap-mandatory auto-cols-[minmax(17.5rem,88vw)] grid-flow-col gap-3 overflow-x-auto px-3 pb-4 pt-4 sm:auto-cols-[minmax(19rem,1fr)] sm:px-5 xl:grid-flow-row xl:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,0.8fr)] xl:overflow-visible">
        {BOARD_LANES.map((lane) => (
          <BarOrders key={lane.title} lane={lane} station={station} />
        ))}
      </div>
    </section>
  );
};

export default OrdersList;
