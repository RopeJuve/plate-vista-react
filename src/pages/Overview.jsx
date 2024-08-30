import React from "react";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { dropdownData } from "../data/data";
import { SparkLine } from "../Components/AdminComponents";
import { bestEmployees, earningData } from "../data/data";
import { useStateContext } from "../contexts/ContextProvider";
import { LinePrimaryXAxis, LinePrimaryYAxis } from "../data/data";
import { useFetchOrdersForCharts } from "../utils/fetchOrdersForCharts";
import { useNavigate } from "react-router-dom"


const DropDown = ({ currentMode }) => (
  <div className="w-28 border-1 border-color px-2 py-1 rounded-md">
    <DropDownListComponent
      id="time"
      fields={{ text: "Time", value: "Id" }}
      style={{ border: "none", color: currentMode === "Dark" && "white" }}
      value="1"
      dataSource={dropdownData}
      popupHeight="220px"
      popupWidth="120px"
    />
  </div>
);

const Overview = () => {
  const { currentColor, currentMode, totalOrders } = useStateContext();
  const { lineChartData, totalIncome } = useFetchOrdersForCharts();
  const navigate = useNavigate();

  const handleNavigateToTotalIncome = () => {
    navigate('/admin/TotalIncome');}

  
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
            <div
              onClick={handleNavigateToTotalIncome}
              key={item.title}
              className="h-54 p-8 pt-9 rounded-2xl w-72 md:w-400 relative"
              style={{ backgroundColor: item.bgColor, color: item.textColor, cursor: 'pointer' }}
            >
              <div className="flex items-start">
                <button
                  type="button"
                  style={{ color: item.iconColor, backgroundColor: item.iconBg }}
                  className="text-2xl opacity-0.9 rounded-full p-4 hover:drop-shadow-xl"
                >
                  <item.icon />
                </button>
                <div className="ml-4">
                  <p className="text-xl font-semibold">{item.title}</p>
                  <p className="text-sm mt-1">{item.name}</p>
                </div>
              </div>
              <p className="text-lg font-semibold absolute bottom-4 right-4">
                {item.amount}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Best Employees and Daily Sales */}
      <div className="flex flex-wrap lg:flex-nowrap justify-center p-4 gap-4">
        {/* Best Employees */}
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <p className="text-xl font-semibold">Best Employees</p>
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
                    <item.icon />
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

        {/* Daily Sales */}
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl w-96 md:w-760">
          <div className="flex justify-between items-center gap-2 mb-10">
            <p className="text-xl font-semibold">Daily Sales</p>
            <DropDown currentMode={currentMode} />
          </div>
          <div className="mt-4">
            <SparkLine
              id="line-chart"
              height="400px"
              primaryXAxis={LinePrimaryXAxis}
              primaryYAxis={LinePrimaryYAxis}
              chartArea={{ border: { width: 0 } }}
              tooltip={{ enable: true }}
              background={currentMode === 'Dark' ? '#33373E' : '#fff'}
              data={lineChartData}
              color={currentColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
