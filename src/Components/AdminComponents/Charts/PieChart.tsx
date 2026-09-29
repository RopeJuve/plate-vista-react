import { Cell, Pie, PieChart as RechartsPieChart } from "recharts";
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
  "hsl(var(--signal-deep))",
  "hsl(var(--steel-500))",
];

const PieChart = ({ id, data, legendVisiblity = true, height }: PieChartProps) => {
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
      style={{ height: height === "full" ? 420 : height || 400 }}
    >
      <RechartsPieChart>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        {legendVisiblity ? <ChartLegend content={<ChartLegendContent className="flex-wrap" />} /> : null}
        <Pie
          data={data}
          dataKey="y"
          nameKey="x"
          innerRadius="48%"
          outerRadius="72%"
          paddingAngle={2}
          stroke="hsl(var(--card))"
          strokeWidth={2}
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
