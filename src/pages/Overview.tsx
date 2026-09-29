import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, X } from "lucide-react";
import { dropdownData, bestEmployees, earningData } from "../data/data";
import LineChart from "../Components/AdminComponents/Charts/LineChart";
import { Header } from "../Components/AdminComponents";
import { Chit } from "../Components/rail";
import { useFetchOrdersForCharts } from "../utils/fetchOrdersForCharts";
import { formatCents } from "../shared/money/formatCents";
import { consumeOnboarding, dismissOnboarding } from "../features/admin/onboarding";
import { fetchOrders, readOrdersPayload } from "../services/orderDataFetch";
import { notify } from "../utils/notify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DropDown = () => (
  <div className="w-36">
    <Select defaultValue="1">
      <SelectTrigger aria-label="Time range" className="h-9 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {dropdownData.map((item) => (
          <SelectItem key={item.Id} value={item.Id}>
            {item.Time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

const ROUTES: Record<string, string> = {
  "Total Income": "/admin/totalincome",
  "Total Orders": "/admin/totalorders",
  "Trending Dishes": "/admin/trendingdishes",
};

const today = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long" }).format(new Date());

const Overview = () => {
  const { lineChartData, totalIncome } = useFetchOrdersForCharts();
  const [totalOrders, setTotalOrders] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(() => consumeOnboarding());
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders({ page: 1, limit: 1 })
      .then((response) => {
        setTotalOrders(readOrdersPayload(response.data).total);
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error("Error fetching order total:", error);
        }
        notify(error.response?.data?.message || "Could not load order total");
      });
  }, []);

  const updatedEarningData = earningData.map((item) => {
    if (item.title === "Total Orders") {
      return { ...item, amount: totalOrders };
    }
    if (item.title === "Total Income") {
      return { ...item, amount: formatCents(totalIncome) };
    }
    return item;
  });
  // The report reads like a till: money first, then covers, then what sold.
  const reportLines = ["Total Income", "Total Orders", "Trending Dishes"]
    .map((title) => updatedEarningData.find((item) => item.title === title))
    .filter((item): item is (typeof updatedEarningData)[number] => Boolean(item));

  return (
    <div>
      <Header title="Overview" description={today} />

      {showOnboarding && (
        <div className="mb-6 flex items-start gap-4 rounded-xl bg-ink p-5 text-paper">
          <div className="flex-1">
            <p className="text-lg font-bold">Your restaurant is ready.</p>
            <p className="mt-1 text-sm text-paper/75">
              Create your first table and menu item, then print its QR code so guests can order.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="h-9 rounded-md bg-signal px-3 text-sm font-semibold text-ink hover:bg-signal-deep"
                onClick={() => navigate("/admin/tables")}
              >
                Add a table
              </button>
              <button
                type="button"
                className="h-9 rounded-md bg-white/10 px-3 text-sm font-semibold hover:bg-white/15"
                onClick={() => navigate("/admin/menu")}
              >
                Add a menu item
              </button>
            </div>
          </div>
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-md text-paper/70 hover:bg-white/10 hover:text-paper"
            aria-label="Dismiss"
            onClick={() => {
              dismissOnboarding();
              setShowOnboarding(false);
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
        <Chit lift="paper" innerClassName="bg-white px-6 pt-6">
          <div className="text-center">
            <h2 className="text-lg font-black uppercase tracking-[0.12em]">Z-Report</h2>
            <p className="mt-1 font-mono text-xs uppercase tracking-[0.14em] text-ink-soft">All time</p>
          </div>
          <div className="perf my-5" />
          <ul className="space-y-1">
            {reportLines.map((item) => (
              <li key={item.title}>
                <button
                  type="button"
                  onClick={() => navigate(ROUTES[item.title])}
                  aria-label={`${item.title} ${item.amount}`}
                  className="group -mx-2 flex w-[calc(100%+1rem)] items-end gap-3 rounded-md px-2 py-3 text-left transition-colors hover:bg-ink/[0.04]"
                >
                  <item.icon className="mb-0.5 h-4 w-4 shrink-0 text-ink-soft" aria-hidden="true" />
                  <span className="min-w-0">
                    <span className="block text-sm font-bold leading-5">{item.title}</span>
                    {item.name && <span className="block truncate text-xs leading-4 text-ink-soft">{item.name}</span>}
                  </span>
                  <span className="leader mb-1" aria-hidden="true" />
                  <span className="font-mono text-lg font-bold leading-5 tabular">{item.amount}</span>
                  <ArrowUpRight className="mb-0.5 h-4 w-4 shrink-0 text-ink/30 transition-colors group-hover:text-signal-ink" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <div className="perf my-5" />
          <p className="pb-3 text-center font-mono text-[0.7rem] uppercase tracking-[0.2em] text-ink-soft">
            Plate Vista
          </p>
        </Chit>

        <section className="min-w-0 rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6" aria-labelledby="sales-title">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="sales-title" className="text-lg font-bold">
              <button type="button" className="hover:text-signal-ink" onClick={() => navigate("/admin/dailysales")}>
                Daily Sales
              </button>
            </h2>
            <DropDown />
          </div>
          <LineChart data={lineChartData} />
        </section>
      </div>

      <section className="mt-6 rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6" aria-labelledby="staff-title">
        <div className="mb-2 flex items-center justify-between">
          <h2 id="staff-title" className="text-lg font-bold">
            <button type="button" className="hover:text-signal-ink" onClick={() => navigate("/admin/bestemployees")}>
              Best Employees
            </button>
          </h2>
          <span className="font-mono text-xs uppercase tracking-[0.12em] text-ink-soft">Sample data</span>
        </div>
        <ol className="grid gap-x-8 sm:grid-cols-2 xl:grid-cols-3">
          {bestEmployees.map((item, index) => (
            <li key={item.desc} className="flex items-center gap-3 border-b border-dashed border-ink/10 py-3">
              <span className="w-6 font-mono text-sm text-ink-soft tabular">{index + 1}</span>
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-sm font-black text-paper" aria-hidden="true">
                {item.desc.charAt(0)}
              </span>
              <span className="flex-1 font-semibold">{item.desc}</span>
              <span className="font-mono text-sm font-bold text-pass-ink tabular">{item.revenue}</span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};

export default Overview;
