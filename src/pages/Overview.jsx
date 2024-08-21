import React from "react";
import { BsPerson } from "react-icons/bs";
import { FaBowlFood } from "react-icons/fa6";
import { AiOutlineShoppingCart } from "react-icons/ai";
import { BsCurrencyDollar } from "react-icons/bs";
import { GoDotFill } from "react-icons/go";
import { IoIosMore } from "react-icons/io";

import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";

import {
  medicalproBranding,
  recentTransactions,
  weeklyStats,
  dropdownData,
  SparklineAreaData,
  ecomPieChartData,
} from "../data/data";

import {
  Stacked,
  Pie,
  Button,
  LineChart,
  SparkLine,
} from "../components/AdminComponents";

import {
  trendingDishes,
  totalOrders,
  lineCustomSeries,
  bestEmployees,
  earningData,
} from "../data/data";

import { useStateContext } from "../contexts/ContextProvider";

const DropDown = ({ currentMode }) => (
  <div className="w-28 border-1 border-color px-2 py-1 rounded-md">
    <DropDownListComponent id="time" fields={{ text: 'Time', value: 'Id' }} style={{ border: 'none', color: (currentMode === 'Dark') && 'white' }} value="1" dataSource={dropdownData} popupHeight="220px" popupWidth="120px" />
  </div>
);

const Overview = () => {
  const { currentColor } = useStateContext();
  return (
    <div className="mt-24">
      <div className="flex flex-wrap lg:flex-nowrap justify-center">
        {/* <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg h-44 rounded-xl w-full lg:w-80 p-8 pt-9 m-3 bg-hero-pattern bg-no-repeat bg-cover bg-center">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-400">Total Income</p>
              <p className="text-2xl">$20000,89</p>
            </div>
          </div>
          <div className="mt-6">
            <Button
              color="white"
              bgColor="blue"
              text="Download"
              borderRadius="10px"
              size="md"
            />
          </div>
        </div> */}
        <div className="flex m-3 flex-wrap justify-center gap-4 items-center w-full">
          {earningData.map((item) => (
            <div
              key={item.title}
              className={`h-54 p-4 pt-9 rounded-2xl w-72 md:w-400`}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <button
                type="button"
                style={{ color: item.iconColor, backgroundColor: item.iconBg }}
                className="text-2xl opacity-0.9 rounded-full p-4 hover:drop-shadow-xl"
              >
                <item.icon />
              </button>
              <p className="text-xl text-gray-400 mt-1">{item.title}</p>

              <p className="flex items-center justify-between text-sm text-gray-400 mt-1">
                <span>{item.name}</span>
                <span className="text-lg font-semibold">{item.amount}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap lg:flex-nowrap justify-center p-4 gap-4">
        <div className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg p-6 rounded-2xl">
          <div className="flex justify-between items-center gap-2">
            <p className="text-xl font-semibold">Best Employees</p>
            {/* <DropDown currentMode={currentMode} /> */}
          </div>
          {/* Best Employees */}
          <div className="mt-10 w-72 md:w-400">
            {bestEmployees.map((item) => (
              <div key={item.desc} className="flex justify-between mt-4">
                <div className="flex gap-4">
                  <button
                    type="button"
                    style={{
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
            {/* put currentMode={currentMode} down on the below line in the DropDown */}
            <DropDown />
          </div>
          <div className="mt-4">
            <SparkLine
              currentColor={currentColor}
              id="column-sparkLine"
              height="100px"
              type="Column"
              data={SparklineAreaData}
              width="320"
              color={currentColor}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
