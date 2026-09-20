import { format } from "date-fns";
import { CartesianGrid, Line, LineChart as RechartsLineChart, XAxis, YAxis } from "recharts";
import { useStateContext } from "../../../contexts/ContextProvider";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type LineSeries = {
  name: string;
  dataSource: { x: Date | string | number; y: number }[];
};

type LineChartProps = {
  data?: LineSeries[];
  color?: string;
};

const toDateKey = (value: Date | string | number) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toISOString();
};

const toSeriesKey = (name: string) => name.replace(/[^a-zA-Z0-9_-]/g, "_");

const toChartRows = (series: LineSeries[]) => {
  const rowsByX = new Map<string, Record<string, string | number>>();

  series.forEach((item) => {
    const seriesKey = toSeriesKey(item.name);
    (item.dataSource || []).forEach((point) => {
      const key = toDateKey(point.x);
      const existing = rowsByX.get(key) || { x: key };
      existing[seriesKey] = point.y;
      rowsByX.set(key, existing);
    });
  });

  return Array.from(rowsByX.values()).sort(
    (a, b) => new Date(a.x).getTime() - new Date(b.x).getTime()
  );
};

const LineChart = ({ data, color }: LineChartProps) => {
  const { currentMode } = useStateContext();

  if (!data || data.length === 0) {
    return <div>Loading</div>;
  }

  const sortedData = data.map((series) => ({
    ...series,
    dataSource: [...(series.dataSource || [])].sort(
      (a, b) => new Date(a.x).getTime() - new Date(b.x).getTime()
    ),
  }));

  const rows = toChartRows(sortedData);
  const config = sortedData.reduce<ChartConfig>((acc, series, index) => {
    acc[toSeriesKey(series.name)] = {
      label: series.name,
      color: color || `hsl(var(--chart-${(index % 5) + 1}))`,
    };
    return acc;
  }, {});

  return (
    <ChartContainer
      config={config}
      className="h-[400px] w-full"
      style={{ background: currentMode === "Dark" ? "#33373E" : "#fff" }}
    >
      <RechartsLineChart data={rows} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="x"
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => {
            const date = new Date(value);
            return Number.isNaN(date.getTime()) ? String(value) : format(date, "h:mm a");
          }}
        />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        {sortedData.map((series) => {
          const seriesKey = toSeriesKey(series.name);
          return (
            <Line
              key={seriesKey}
              type="monotone"
              dataKey={seriesKey}
              stroke={`var(--color-${seriesKey})`}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          );
        })}
      </RechartsLineChart>
    </ChartContainer>
  );
};

export default LineChart;
