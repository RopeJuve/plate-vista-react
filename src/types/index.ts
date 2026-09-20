import { ORDER_STATUS } from "@/constants/orderStatus";

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export type User = {
  _id?: string;
  id?: string;
  employee?: string;
  position?: string;
  role?: string;
  email?: string;
};

export type Employee = {
  _id?: string;
  employeeId?: string;
  employee?: string;
  email?: string;
  position?: string;
};

export type MenuItem = {
  _id: string;
  title: string;
  description?: string;
  price: number | string;
  image?: string;
  category?: string;
  popular?: boolean;
  inStock?: boolean;
};

export type RestaurantTable = {
  _id?: string;
  tableNumber: string | number;
  seats?: number;
  status?: string;
  capacity?: number;
  customers?: number;
  createdAt?: string;
  updatedAt?: string;
  orders?: unknown[];
};

export type Table = RestaurantTable;

export type CartItem = MenuItem & {
  quantity: number;
};

export type OrderMenuItem = {
  title?: string;
  name?: string;
  quantity?: number;
  product?: {
    title?: string;
    category?: string;
  };
};

export type Order = {
  _id?: string;
  orderId?: string;
  user?: string | { username?: string };
  menuItems?: Array<OrderMenuItem | string>;
  quantity?: number;
  totalPrice?: number;
  orderStatus?: string;
  location?: string;
  createdAt?: string;
  tableNumber?: string | number;
  table?: { tableNumber?: string | number };
};

export type OrderRow = {
  user: string;
  menuItems: { title: string; quantity: number }[];
  quantity: number;
  totalPrice: number;
  orderStatus?: string;
  location: string | number;
  orderId?: string;
};

export type EmployeeRow = {
  employeeId?: string;
  employee?: string;
  email?: string;
  position?: string;
};

export type ChartPoint = {
  x: Date | string;
  y: number;
};

export type ChartSeries = {
  name: string;
  dataSource: ChartPoint[];
};
