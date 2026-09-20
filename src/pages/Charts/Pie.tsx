import PieChart from "../../Components/AdminComponents/Charts/PieChart";
import { pieChartData } from "../../data/data";

const Pie = () => (
  <div className="w-full">
    <PieChart id="chart-pie" data={pieChartData} legendVisiblity height="full" />
  </div>
);

export default Pie;
