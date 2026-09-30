import { useState } from "react";
import Line from "./Charts/Line";
import Header from "../Components/AdminComponents/Header";
import RangeSelect from "../features/stats/RangeSelect";
import { useSalesByDate, useSummary } from "../features/stats/hooks/useStats";
import { rangeLabel, xFormatFor, type StatsRange } from "../features/stats/statsRange";
import { formatCents } from "../shared/money/formatCents";

const TotalIncome = () => {
  const [range, setRange] = useState<StatsRange>("30d");
  const { revenue } = useSalesByDate(range);
  const { data: summary } = useSummary(range);

  return (
    <div>
      <Header
        title="Total Income"
        description={`${rangeLabel(range)} · ${summary.ordersCount} orders · average ${formatCents(summary.averageOrderCents)}`}
        actions={
          <div className="flex flex-wrap items-center gap-4">
            <p className="font-mono text-3xl font-bold tracking-[-0.02em] tabular md:text-4xl">
              {formatCents(summary.totalCents)}
            </p>
            <RangeSelect value={range} onChange={setRange} />
          </div>
        }
      />
      <section className="rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6">
        <Line data={revenue} xFormat={xFormatFor(range)} />
      </section>
    </div>
  );
};

export default TotalIncome;
