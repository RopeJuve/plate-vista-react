import { Cell, Pie, PieChart as RechartsPieChart } from "recharts";
import { useStateContext } from "../../../contexts/ContextProvider";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type PieDatum = {
  x: string;
  y: number;
  text?: string;
};

type PieChartProps = {
  id?: string;
  data: PieDatum[];
  legendVisiblity?: boolean;
  height?: string;
};

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#7352FF",
  "#FF5C8E",
];

const PieChart = ({ id, data, legendVisiblity = true, height }: PieChartProps) => {
  const { currentMode } = useStateContext();

  const config = data.reduce<ChartConfig>((acc, item, index) => {
    acc[item.x] = {
      label: item.x,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {});

  return (
    <ChartContainer
      id={id}
      config={config}
      className="w-full"
      style={{
        height: height === "full" ? 420 : height || 400,
        background: currentMode === "Dark" ? "#33373E" : "#fff",
      }}
    >
      <RechartsPieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        {legendVisiblity ? <ChartLegend content={<ChartLegendContent />} /> : null}
        <Pie
          data={data}
          dataKey="y"
          nameKey="x"
          innerRadius="40%"
          outerRadius="70%"
          label={({ payload }) => payload.text || payload.x}
        >
          {data.map((entry, index) => (
            <Cell key={entry.x} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </RechartsPieChart>
    </ChartContainer>
  );
};

export default PieChart;
