import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { barChartRows, barChartConfig } from "../../data/data";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const BarPage = () => {
  return (
    <ChartContainer config={barChartConfig} className="h-[400px] w-full">
      <BarChart data={barChartRows}>
        <CartesianGrid vertical={false} strokeDasharray="3 4" />
        <XAxis dataKey="day" tickLine={false} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} hide />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="Peter" fill="var(--color-Peter)" radius={4} />
        <Bar dataKey="Robert" fill="var(--color-Robert)" radius={4} />
        <Bar dataKey="John" fill="var(--color-John)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
};

export default BarPage;
