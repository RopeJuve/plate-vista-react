import { format } from "date-fns";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { dateOfKey, type CategoryChart } from "../../../features/stats/statsRange";

type StackedProps = {
  chart: CategoryChart;
  xFormat?: string;
  height?: string | number;
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

// Items sold per day, one stacked segment per menu category.
const Stacked = ({ chart, xFormat = "d MMM", height }: StackedProps) => {
  const config = chart.categories.reduce<ChartConfig>((acc, category, index) => {
    acc[category.key] = { label: category.label, color: COLORS[index % COLORS.length] };
    return acc;
  }, {});
  const rows = chart.rows.map((row) => ({ ...row, label: format(dateOfKey(String(row.date)), xFormat) }));

  return (
    <ChartContainer config={config} className="w-full" style={{ height: height || 420 }}>
      <BarChart data={rows}>
        <CartesianGrid vertical={false} strokeDasharray="3 4" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={36} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent className="flex-wrap" />} />
        {chart.categories.map((category) => (
          <Bar key={category.key} dataKey={category.key} stackId="sold" fill={`var(--color-${category.key})`} />
        ))}
      </BarChart>
    </ChartContainer>
  );
};

export default Stacked;
