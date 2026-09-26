import LineChart from "../../Components/AdminComponents/Charts/LineChart";
import type { ChartSeries } from "../../types";

const Line = ({ data }: { data?: ChartSeries[] }) => (
  <div className="w-full">
    <LineChart data={data} />
  </div>
);

export default Line;
