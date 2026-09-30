import { useMemo, useState } from "react";
import Stacked from "../Components/AdminComponents/Charts/Stacked";
import Header from "../Components/AdminComponents/Header";
import RangeSelect from "../features/stats/RangeSelect";
import { useSalesByCategory, useSummary } from "../features/stats/hooks/useStats";
import { pivotCategories, rangeLabel, xFormatFor, type StatsRange } from "../features/stats/statsRange";

const TotalOrders = () => {
  const [range, setRange] = useState<StatsRange>("7d");
  const { data: sales, loading } = useSalesByCategory(range);
  const { data: summary } = useSummary(range);
  const chart = useMemo(() => pivotCategories(Array.isArray(sales) ? sales : [], range), [sales, range]);

  return (
    <div>
      <Header
        title="Total Orders"
        description={`${summary.ordersCount} orders and ${summary.itemsSold} items sold, by menu category · ${rangeLabel(range)}`}
        actions={<RangeSelect value={range} onChange={setRange} />}
      />
      <section className="rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6">
        {chart.categories.length === 0 ? (
          <div className="grid h-[320px] place-items-center rounded-lg border border-dashed border-ink/15 text-center">
            <p className="font-semibold">{loading ? "Loading…" : "Nothing sold in this period yet"}</p>
          </div>
        ) : (
          <Stacked chart={chart} xFormat={xFormatFor(range)} />
        )}
      </section>
    </div>
  );
};

export default TotalOrders;
