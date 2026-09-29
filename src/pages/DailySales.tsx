import Line from './Charts/Line';
import Header from '../Components/AdminComponents/Header';
import { useFetchOrdersForCharts } from "../utils/fetchOrdersForCharts";

const DailySales = () => {
  const { lineChartData } = useFetchOrdersForCharts();

  return (
    <div>
      <Header title="Daily Sales" description="Orders by day." />
      <section className="rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6">
        <Line data={lineChartData} />
      </section>
    </div>
  );
};

export default DailySales;
