import { useState } from "react";
import Pie from "./Charts/Pie";
import Header from "../Components/AdminComponents/Header";
import RangeSelect from "../features/stats/RangeSelect";
import { useSummary, useTopDishes } from "../features/stats/useStats";
import { rangeLabel, type StatsRange } from "../features/stats/statsRange";
import { formatCents } from "../shared/money/formatCents";

const TOP = 6;

const percent = (part: number, whole: number) => `${Math.round((part / whole) * 100)}%`;

const TrendingDishes = () => {
  const [range, setRange] = useState<StatsRange>("30d");
  const { data: dishes, loading } = useTopDishes(range, TOP);
  const { data: summary } = useSummary(range);

  // Slices for the top dishes, plus one for everything else that sold.
  const topSold = dishes.reduce((sum, dish) => sum + dish.numSold, 0);
  const otherSold = Math.max(summary.itemsSold - topSold, 0);
  const whole = topSold + otherSold;
  const slices = [
    ...dishes.map((dish) => ({ x: dish.menu_item, y: dish.numSold })),
    ...(otherSold > 0 ? [{ x: "Other", y: otherSold }] : []),
  ].map((slice) => ({ ...slice, text: percent(slice.y, whole) }));

  return (
    <div>
      <Header
        title="Trending Dishes"
        description={`Share of items sold · ${rangeLabel(range)}`}
        actions={<RangeSelect value={range} onChange={setRange} />}
      />
      <section className="rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6">
        {slices.length === 0 ? (
          <div className="grid h-[320px] place-items-center rounded-lg border border-dashed border-ink/15 text-center">
            <p className="font-semibold">{loading ? "Loading…" : "Nothing sold in this period yet"}</p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <Pie data={slices} />
            <ol className="self-center">
              {dishes.map((dish, index) => (
                <li key={dish.menu_item} className="flex items-center gap-3 border-b border-dashed border-ink/10 py-3">
                  <span className="w-6 font-mono text-sm text-ink-soft tabular">{index + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{dish.menu_item}</span>
                    <span className="block text-xs text-ink-soft">{dish.numSold} sold</span>
                  </span>
                  <span className="font-mono text-sm font-bold tabular">{formatCents(dish.totalCents)}</span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </section>
    </div>
  );
};

export default TrendingDishes;
