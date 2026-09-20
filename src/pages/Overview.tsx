import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { dropdownData, bestEmployees, earningData } from "../data/data";
import LineChart from "../Components/AdminComponents/Charts/LineChart";
import { useStateContext } from "../contexts/ContextProvider";
import { useFetchOrdersForCharts } from "../utils/fetchOrdersForCharts";
import { fetchOrders } from "../services/orderDataFetch";
import { notify } from "../utils/notify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DropDown = () => (
  <div className="w-28">
    <Select defaultValue="1">
      <SelectTrigger aria-label="Time range">
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

const Overview = () => {
  const { currentColor } = useStateContext();
  const { lineChartData, totalIncome } = useFetchOrdersForCharts();
  const [totalOrders, setTotalOrders] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders({ page: 1, limit: 1 })
      .then((response) => {
        setTotalOrders(response.data?.total ?? 0);
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error("Error fetching order total:", error);
        }
        notify(error.response?.data?.message || "Could not load order total");
      });
  }, []);

  const handleCardClick = (title: string) => {
    if (title === "Total Income") {
      navigate("/admin/TotalIncome");
    } else if (title === "Total Orders") {
      navigate("/admin/TotalOrders");
    } else if (title === "Trending Dishes") {
      navigate("/admin/TrendingDishes");
    }
  };

  const updatedEarningData = earningData.map((item) => {
    if (item.title === "Total Orders") {
      return { ...item, amount: totalOrders };
    }
    if (item.title === "Total Income") {
      return { ...item, amount: totalIncome };
    }
    return item;
  });

  return (
    <div className="mt-24">
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        <div className="flex m-3 flex-wrap justify-center gap-4 items-center w-full">
          {updatedEarningData.map((item) => (
            <button
              type="button"
              onClick={() => handleCardClick(item.title)}
              key={item.title}
              className="h-54 p-8 pt-9 rounded-2xl w-72 md:w-400 relative text-left"
              style={{
                backgroundColor: item.bgColor,
                color: item.textColor,
                cursor: "pointer",
              }}
              aria-label={`${item.title} ${item.amount}`}
            >
              <div className="flex items-start">
                <span
                  style={{
                    color: item.iconColor,
                    backgroundColor: item.iconBg,
                  }}
                  className="text-2xl opacity-0.9 rounded-full p-4 hover:drop-shadow-xl"
                >
                  <item.icon className="h-6 w-6" />
                </span>
                <div className="ml-4">
                  <p className="text-xl font-semibold">{item.title}</p>
                  <p className="text-sm mt-1">{item.name}</p>
                </div>
              </div>
              <p className="text-lg font-semibold absolute bottom-4 right-4">
                {item.amount}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap lg:flex-nowrap justify-center p-4 gap-4">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <p
              className="text-xl font-semibold"
              onClick={() => navigate("/admin/BestEmployees")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  navigate("/admin/BestEmployees");
                }
              }}
              role="link"
              tabIndex={0}
              style={{ cursor: "pointer" }}
            >
              Best Employees
            </p>
          </div>
          <div className="mt-10 w-72 md:w-400">
            {bestEmployees.map((item) => (
              <div key={item.desc} className="flex justify-between mt-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    style={{
                      color: item.iconColor,
                      backgroundColor: item.iconBg,
                    }}
                    className="text-2xl rounded-lg p-4 hover:drop-shadow-xl"
                  >
                    <item.icon className="h-6 w-6" />
                  </button>
                  <div>
                    <p className="text-md font-semibold">{item.desc}</p>
                  </div>
                </div>
                <p className={`text-${item.pcColor}`}>{item.revenue}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl w-96 md:w-760">
          <div className="flex justify-between items-center gap-2 mb-10">
            <p
              className="text-xl font-semibold"
              onClick={() => navigate("/admin/DailySales")}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  navigate("/admin/DailySales");
                }
              }}
              role="link"
              tabIndex={0}
              style={{ cursor: "pointer" }}
            >
              Daily Sales
            </p>
            <DropDown />
          </div>
          <div className="mt-4">
            <LineChart data={lineChartData} color={currentColor} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
