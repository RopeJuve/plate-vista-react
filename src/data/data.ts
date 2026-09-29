import {
  BookOpen,
  Coins,
  Flame,
  LayoutDashboard,
  LayoutGrid,
  Medal,
  QrCode,
  ReceiptText,
  ShoppingCart,
  Soup,
  TrendingUp,
  User,
  DollarSign,
  Users,
} from "lucide-react";
import type { ChartConfig } from "@/components/ui/chart";

export const links = [
  {
    title: "Numbers",
    links: [
      { name: "overview", label: "Overview", icon: LayoutDashboard },
      { name: "dailysales", label: "Daily Sales", icon: TrendingUp },
      { name: "totalincome", label: "Total Income", icon: Coins },
      { name: "trendingdishes", label: "Trending Dishes", icon: Flame },
      { name: "totalorders", label: "Total Orders", icon: ShoppingCart },
      { name: "bestemployees", label: "Best Employees", icon: Medal },
    ],
  },
  {
    title: "Restaurant",
    links: [
      { name: "menu", label: "Menu", icon: BookOpen },
      { name: "orders", label: "Orders", icon: ReceiptText },
      { name: "tables", label: "Tables", icon: LayoutGrid },
      { name: "employees", label: "Employees", icon: Users },
      { name: "qrcodes", label: "QR Codes", icon: QrCode },
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
    name: "Chicken Alfredo (sample)",
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
  alcoholic: { label: "Alcoholic Beverages", color: "hsl(var(--chart-1))" },
  nonAlcoholic: { label: "Non-Alcoholic Beverages", color: "hsl(var(--chart-4))" },
  mainCourse: { label: "Main Course", color: "hsl(var(--chart-2))" },
  salads: { label: "Salads", color: "hsl(var(--chart-3))" },
  desserts: { label: "Desserts", color: "hsl(var(--chart-5))" },
};
