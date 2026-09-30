import { format } from "date-fns";
import { CartesianGrid, Line, LineChart as RechartsLineChart, XAxis, YAxis } from "recharts";
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
  /** date-fns format for the x axis, e.g. "MMM yy" for monthly data. */
  xFormat?: string;
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

const LineChart = ({ data, color, xFormat = "d MMM" }: LineChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="grid h-[320px] place-items-center rounded-lg border border-dashed border-ink/15 text-center">
        <div>
          <p className="font-semibold">No sales to chart yet</p>
          <p className="mt-1 text-sm text-ink-soft">Orders appear here as soon as guests start ordering.</p>
        </div>
      </div>
    );
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
    <ChartContainer config={config} className="h-[320px] w-full md:h-[360px]">
      <RechartsLineChart data={rows} margin={{ left: 0, right: 12, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 4" />
        <XAxis
          dataKey="x"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tickFormatter={(value) => {
            const date = new Date(value);
            return Number.isNaN(date.getTime()) ? String(value) : format(date, xFormat);
          }}
        />
        <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={36} />
        <ChartTooltip content={<ChartTooltipContent />} />
        {sortedData.length > 1 && <ChartLegend content={<ChartLegendContent />} />}
        {sortedData.map((series) => {
          const seriesKey = toSeriesKey(series.name);
          return (
            <Line
              key={seriesKey}
              type="monotone"
              dataKey={seriesKey}
              stroke={`var(--color-${seriesKey})`}
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          );
        })}
      </RechartsLineChart>
    </ChartContainer>
  );
};

export default LineChart;
