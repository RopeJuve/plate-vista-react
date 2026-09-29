import Line from './Charts/Line';
import Header from '../Components/AdminComponents/Header';
import { useFetchOrdersForCharts } from "../utils/fetchOrdersForCharts";
import { formatCents } from "../shared/money/formatCents";

const TotalIncome = () => {
  const { lineChartData, totalIncome } = useFetchOrdersForCharts();

  return (
    <div>
      <Header
        title="Total Income"
        actions={
          <p className="font-mono text-3xl font-bold tracking-[-0.02em] tabular md:text-4xl">{formatCents(totalIncome)}</p>
        }
      />
      <section className="rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6">
        <Line data={lineChartData} />
      </section>
    </div>
  );
};

export default TotalIncome;
