import {
  BookOpen,
  Tags,
  Coins,
  Flame,
  LayoutDashboard,
  LayoutGrid,
  Medal,
  QrCode,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
  User,
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
      { name: "categories", label: "Categories", icon: Tags },
      { name: "orders", label: "Orders", icon: ReceiptText },
      { name: "tables", label: "Tables", icon: LayoutGrid },
      { name: "employees", label: "Employees", icon: Users },
      { name: "qrcodes", label: "QR Codes", icon: QrCode },
    ],
  },
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
