import LineChart from "../../Components/AdminComponents/Charts/LineChart";
import type { ChartSeries } from "../../types";

const Line = ({ data, xFormat }: { data?: ChartSeries[]; xFormat?: string }) => (
  <div className="w-full">
    <LineChart data={data} xFormat={xFormat} />
  </div>
);

export default Line;
