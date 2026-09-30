import { useState } from "react";
import Line from "./Charts/Line";
import Header from "../Components/AdminComponents/Header";
import RangeSelect from "../features/stats/RangeSelect";
import { useSalesByDate } from "../features/stats/hooks/useStats";
import { xFormatFor, type StatsRange } from "../features/stats/statsRange";

const DailySales = () => {
  const [range, setRange] = useState<StatsRange>("30d");
  const { orders } = useSalesByDate(range);

  return (
    <div>
      <Header
        title="Daily Sales"
        description="Orders per day. Cancelled orders are left out."
        actions={<RangeSelect value={range} onChange={setRange} />}
      />
      <section className="rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6">
        <Line data={orders} xFormat={xFormatFor(range)} />
      </section>
    </div>
  );
};

export default DailySales;
