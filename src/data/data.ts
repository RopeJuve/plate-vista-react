import {
  BarChart2,
  TrendingUp,
  PieChart,
  CreditCard,
  Medal,
  UtensilsCrossed,
  QrCode,
  FileText,
  ShoppingCart,
  Soup,
  User,
  DollarSign,
  Shield,
  Utensils,
  Users,
} from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";

export const links = [
  {
    title: "Dashboard",
    links: [
      { name: "Overview", label: "Overview", icon: BarChart2 },
      { name: "DailySales", label: "Daily Sales", icon: TrendingUp },
      { name: "TotalIncome", label: "Total Income", icon: PieChart },
      { name: "TrendingDishes", label: "Trending Dishes", icon: UtensilsCrossed },
      { name: "TotalOrders", label: "Total Orders", icon: ShoppingCart },
      { name: "BestEmployees", label: "Best Employees", icon: Medal },
    ],
  },
  {
    title: "Pages",
    links: [
      { name: "Menu", label: "Menu", icon: Utensils },
      { name: "Orders", label: "Orders", icon: FileText },
      { name: "Tables", label: "Tables", icon: Utensils },
      { name: "Employees", label: "Employees", icon: Users },
    ],
  },
  {
    title: "Apps",
    links: [
      { name: "QRCodeGenerator", label: "QRCode Generator", icon: QrCode },
    ],
  },
];

export const lineChartData = [
  [
    { x: new Date(2005, 0, 1), y: 21 },
    { x: new Date(2006, 0, 1), y: 24 },
    { x: new Date(2007, 0, 1), y: 36 },
    { x: new Date(2008, 0, 1), y: 38 },
    { x: new Date(2009, 0, 1), y: 54 },
    { x: new Date(2010, 0, 1), y: 57 },
    { x: new Date(2011, 0, 1), y: 70 },
  ],
  [
    { x: new Date(2005, 0, 1), y: 28 },
    { x: new Date(2006, 0, 1), y: 44 },
    { x: new Date(2007, 0, 1), y: 48 },
    { x: new Date(2008, 0, 1), y: 50 },
    { x: new Date(2009, 0, 1), y: 66 },
    { x: new Date(2010, 0, 1), y: 78 },
    { x: new Date(2011, 0, 1), y: 84 },
  ],
  [
    { x: new Date(2005, 0, 1), y: 10 },
    { x: new Date(2006, 0, 1), y: 20 },
    { x: new Date(2007, 0, 1), y: 30 },
    { x: new Date(2008, 0, 1), y: 39 },
    { x: new Date(2009, 0, 1), y: 50 },
    { x: new Date(2010, 0, 1), y: 70 },
    { x: new Date(2011, 0, 1), y: 100 },
  ],
];

export const lineCustomSeries = [
  { name: "Drinks", dataSource: lineChartData[0] },
  { name: "Main Course", dataSource: lineChartData[1] },
  { name: "Deserts", dataSource: lineChartData[2] },
];

export const bestEmployees = [
  {
    icon: User,
    revenue: "+$2000",
    iconColor: "#33373E",
    desc: "Johnathan Doe",
    pcColor: "green-600",
    iconBg: "#E5FAFB",
  },
  {
    icon: User,
    revenue: "+$3000",
    iconColor: "#33373E",
    desc: "Peter Doe",
    pcColor: "green-600",
    iconBg: "rgb(235, 250, 242)",
  },
  {
    icon: User,
    revenue: "+$4000",
    iconColor: "#33373E",
    desc: "Robert Doe",
    pcColor: "green-600",
    iconBg: "rgb(254, 201, 15)",
  },
  {
    icon: User,
    revenue: "+$5000",
    iconColor: "#33373E",
    desc: "Jane Doe",
    pcColor: "green-600",
    iconBg: "rgb(255, 244, 229)",
  },
  {
    icon: User,
    revenue: "+$5000",
    iconColor: "#33373E",
    desc: "Janette Doe",
    pcColor: "green-600",
    iconBg: "rgb(254, 201, 15)",
  },
  {
    icon: User,
    revenue: "+$5000",
    iconColor: "#33373E",
    desc: "Petar Doe",
    pcColor: "green-600",
    iconBg: "rgb(255, 244, 229)",
  },
];

export const earningData = [
  {
    icon: Soup,
    amount: "10",
    title: "Trending Dishes",
    name: "Chicken Alfredo",
    iconColor: "#33373E",
    iconBg: "#E5FAFB",
    pcColor: "red-600",
    bgColor: "#4bd391",
    textColor: undefined as string | undefined,
  },
  {
    icon: DollarSign,
    title: "Total Income",
    iconColor: "#33373E",
    iconBg: "rgb(254, 201, 15)",
    pcColor: "green-600",
    bgColor: "#d58ce6",
    textColor: undefined as string | undefined,
  },
  {
    icon: ShoppingCart,
    title: "Total Orders",
    iconColor: "#33373E",
    iconBg: "rgb(255, 244, 229)",
    pcColor: "green-600",
    bgColor: "#ff7a67",
    textColor: undefined as string | undefined,
  },
];

export const pieChartData = [
  { x: "Chicken Alfredo", y: 18, text: "18%" },
  { x: "Pizza Margherita", y: 8, text: "8%" },
  { x: "Berliner Kindl", y: 15, text: "15%" },
  { x: "Apple Pie", y: 11, text: "11%" },
  { x: "T-bone Steak", y: 18, text: "18%" },
  { x: "Black Angus Steak", y: 14, text: "14%" },
  { x: "Oysters", y: 16, text: "16%" },
];

export const barChartRows = [
  { day: "Mon", Peter: 23, Robert: 46, John: 47 },
  { day: "Tue", Peter: 27, Robert: 26, John: 24 },
  { day: "Wed", Peter: 26, Robert: 12, John: 11 },
  { day: "Thu", Peter: 30, Robert: 32, John: 25 },
  { day: "Fri", Peter: 22, Robert: 11, John: 18 },
];

export const barChartConfig: ChartConfig = {
  Peter: { label: "Peter Orders", color: "hsl(var(--chart-1))" },
  Robert: { label: "Robert Orders", color: "hsl(var(--chart-2))" },
  John: { label: "John Orders", color: "hsl(var(--chart-3))" },
};

export const dropdownData = [
  { Id: "1", Time: "March 2021" },
  { Id: "2", Time: "April 2021" },
  { Id: "3", Time: "May 2021" },
];

export const stackedChartRows = [
  {
    day: "Mon",
    alcoholic: 111.1,
    nonAlcoholic: 111.1,
    mainCourse: 111.1,
    salads: 150.1,
    desserts: 100.1,
  },
  {
    day: "Tue",
    alcoholic: 127.3,
    nonAlcoholic: 127.3,
    mainCourse: 127.3,
    salads: 120.3,
    desserts: 130.3,
  },
  {
    day: "Wed",
    alcoholic: 143.4,
    nonAlcoholic: 143.4,
    mainCourse: 143.4,
    salads: 163.4,
    desserts: 127.4,
  },
  {
    day: "Thu",
    alcoholic: 159.9,
    nonAlcoholic: 159.9,
    mainCourse: 159.9,
    salads: 129.9,
    desserts: 159.9,
  },
  {
    day: "Fri",
    alcoholic: 159.9,
    nonAlcoholic: 159.9,
    mainCourse: 159.9,
    salads: 129.9,
    desserts: 189.9,
  },
];

export const stackedChartConfig: ChartConfig = {
  alcoholic: { label: "Alcoholic Beverages", color: "green" },
  nonAlcoholic: { label: "Non-Alcoholic Beverages", color: "gold" },
  mainCourse: { label: "Main Course", color: "blue" },
  salads: { label: "Salads", color: "red" },
  desserts: { label: "Desserts", color: "pink" },
};

export const userProfileData = [
  {
    icon: DollarSign,
    title: "My Profile",
    desc: "Account Settings",
    iconColor: "#03C9D7",
    iconBg: "#E5FAFB",
  },
  {
    icon: Shield,
    title: "My Inbox",
    desc: "Messages & Emails",
    iconColor: "rgb(0, 194, 146)",
    iconBg: "rgb(235, 250, 242)",
  },
  {
    icon: CreditCard,
    title: "My Tasks",
    desc: "To-do and Daily Tasks",
    iconColor: "rgb(255, 244, 229)",
    iconBg: "rgb(254, 201, 15)",
  },
];

export const chatData = [
  { message: "Order N123 has been changed", desc: "View order", time: "9:08 AM" },
  { message: "New order received", desc: "View order", time: "11:56 AM" },
  { message: "New Payment received", desc: "View order", time: "4:39 AM" },
  { message: "New item added to the menu", desc: "View item", time: "1:12 AM" },
];

export const themeColors = [
  { name: "blue-theme", color: "#1A97F5" },
  { name: "green-theme", color: "#03C9D7" },
  { name: "purple-theme", color: "#7352FF" },
  { name: "red-theme", color: "#FF5C8E" },
  { name: "indigo-theme", color: "#1E4DB7" },
  { name: "orange-theme", color: "#FB9678" },
];

export const tableColors = [
  "rgb(75, 211, 145)",
  "rgb(213, 140, 230)",
  "rgb(255, 122, 103)",
  "rgb(102, 153, 255)",
  "rgb(255, 189, 68)",
  "rgb(144, 224, 239)",
  "rgb(255, 105, 180)",
];
