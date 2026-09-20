import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { barChartRows, barChartConfig } from "../../data/data";
import { useStateContext } from "../../contexts/ContextProvider";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const BarPage = () => {
  const { currentMode } = useStateContext();

  return (
    <ChartContainer
      config={barChartConfig}
      className="h-[400px] w-full"
      style={{ background: currentMode === "Dark" ? "#33373E" : "#fff" }}
    >
      <BarChart data={barChartRows}>
        <CartesianGrid vertical={false} />
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
