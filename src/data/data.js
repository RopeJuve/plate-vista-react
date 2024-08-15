import React from "react";
import {
  FiBarChart2,
  FiPieChart,
  FiTrendingUp,
} from "react-icons/fi";
import { FaMedal } from "react-icons/fa";
import { GiHotMeal } from "react-icons/gi";
import {
  AiOutlineShoppingCart,
  AiOutlineFileText,
  AiOutlineCalendar,
} from "react-icons/ai";
import { MdRestaurantMenu, MdOutlineTableRestaurant } from "react-icons/md";
import { IoMdPeople } from "react-icons/io";

export const links = [
  {
    title: "Dashboard",
    links: [
      {
        name: "Overview",
        icon: FiBarChart2,
      },
      {
        name: "Daily Sales",
        icon: FiTrendingUp,
      },
      {
        name: "Total Income",
        icon: FiPieChart,
      },
      {
        name: "Trending Dishes",
        icon: GiHotMeal,
      },
      {
        name: "Total Orders",
        icon: AiOutlineShoppingCart,
      },
      {
        name: "Best Employees",
        icon: FaMedal,
      },
    ],
  },
  {
    title: "Pages",
    links: [
      {
        name: "Menu",
        icon: MdRestaurantMenu,
      },
      {
        name: "Orders",
        icon: AiOutlineFileText,
      },
      {
        name: "Tables",
        icon: MdOutlineTableRestaurant,
      },
      {
        name: "Employees",
        icon: IoMdPeople,
      },
    ],
  },
  {
    title: "Apps",
    links: [
      {
        name: "Calendar",
        icon: AiOutlineCalendar,
      },
    ],
  },
];
