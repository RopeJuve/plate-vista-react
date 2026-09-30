import PieChart from "../../Components/AdminComponents/Charts/PieChart";

type PieProps = { data: { x: string; y: number; text?: string }[] };

const Pie = ({ data }: PieProps) => (
  <div className="w-full">
    <PieChart id="chart-pie" data={data} legendVisiblity height="full" />
  </div>
);

export default Pie;
