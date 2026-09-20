import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { stackedChartRows, stackedChartConfig } from "../../../data/data";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type StackedProps = {
  width?: string | number;
  height?: string | number;
};

const Stacked = ({ width, height }: StackedProps) => (
  <ChartContainer
    config={stackedChartConfig}
    className="w-full"
    style={{ width, height: height || 420 }}
  >
    <BarChart data={stackedChartRows} layout="vertical" margin={{ left: 24 }}>
      <CartesianGrid horizontal={false} />
      <XAxis type="number" hide />
      <YAxis dataKey="day" type="category" tickLine={false} axisLine={false} />
      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend content={<ChartLegendContent />} />
      <Bar dataKey="alcoholic" stackId="a" fill="var(--color-alcoholic)" />
      <Bar dataKey="nonAlcoholic" stackId="a" fill="var(--color-nonAlcoholic)" />
      <Bar dataKey="mainCourse" stackId="a" fill="var(--color-mainCourse)" />
      <Bar dataKey="salads" stackId="a" fill="var(--color-salads)" />
      <Bar dataKey="desserts" stackId="a" fill="var(--color-desserts)" />
    </BarChart>
  </ChartContainer>
);

export default Stacked;
