import React from "react";
import { FiBarChart2, FiTrendingUp, FiShoppingBag, FiEdit, FiPieChart, FiBarChart, FiCreditCard, FiStar, FiShoppingCart } from "react-icons/fi";
import { FaMedal } from "react-icons/fa";
import { GiHotMeal } from "react-icons/gi";
import { AiOutlineFileText, AiOutlineCalendar, AiOutlineShoppingCart, AiOutlineAreaChart, AiOutlineBarChart, AiOutlineStock } from "react-icons/ai";
import { FaBowlFood } from "react-icons/fa6";
import { BsPerson, BsBarChart, BsBoxSeam, BsCurrencyDollar, BsShield, BsChatLeft, BsKanban } from "react-icons/bs";
import { MdRestaurantMenu, MdOutlineTableRestaurant, MdOutlineSupervisorAccount } from "react-icons/md";
import { IoMdPeople, IoMdContacts } from "react-icons/io";
import { BiColorFill } from 'react-icons/bi';
import { RiContactsLine, RiStockLine } from 'react-icons/ri';
import { HiOutlineRefresh } from 'react-icons/hi';
import { TiTick } from 'react-icons/ti';
import { FaDollarSign } from "react-icons/fa";




export const links = [
  {
    title: "Dashboard",
    links: [
      {
        name: "Overview",
        label: "Overview",
        icon: FiBarChart2,
      },
      {
        name: "DailySales",
        label: "Daily Sales",
        icon: FiTrendingUp,
      },
      {
        name: "TotalIncome",
        label: "Total Income",
        icon: FiPieChart,
      },
      {
        name: "TrendingDishes",
        label: "Trending Dishes",
        icon: GiHotMeal,
      },
      {
        name: "TotalOrders",
        label: "Total Orders",
        icon: AiOutlineShoppingCart,
      },
      {
        name: "BestEmployees",
        label: "Best Employees",
        icon: FaMedal,
      },
    ],
  },
  {
    title: "Pages",
    links: [
      {
        name: "Menu",
        label: "Menu",
        icon: MdRestaurantMenu,
      },
      {
        name: "Orders",
        label: "Orders",
        icon: AiOutlineFileText,
      },
      {
        name: "Tables",
        label: "Tables",
        icon: MdOutlineTableRestaurant,
      },
      {
        name: "Employees",
        label: "Employees",
        icon: IoMdPeople,
      },
    ],
  },
  {
    title: "Apps",
    links: [
      {
        name: "Calendar",
        label: "Calendar",
        icon: AiOutlineCalendar,
      },
      {
        name: "Kanban",
        label: "Kanban",
        icon: BsKanban,
      },
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

// DATA FOR OVERVIEW PAGE!

// Trending Dishes
export const trendingDishes = [
  {
    icon: FaBowlFood,
    amount: "10",
    title: "Chicken Alfredo",
    pcColor: "green-600",
  },
];

// Total Income - I dont need data, only a number with $ sign

// Total Orders
export const totalOrders = [
  {
    icon: AiOutlineShoppingCart,
    revenue: "20000",
    desc: "Total Orders",
    pcColor: "green-600",
  },
];

// Daily Sales
export const lineCustomSeries = [
  {
    dataSource: lineChartData[0],
    xName: "x",
    yName: "y",
    name: "Drinks",
    width: "2",
    marker: { visible: true, width: 10, height: 10 },
    type: "Line",
  },

  {
    dataSource: lineChartData[1],
    xName: "x",
    yName: "y",
    name: "Main Course",
    width: "2",
    marker: { visible: true, width: 10, height: 10 },
    type: "Line",
  },

  {
    dataSource: lineChartData[2],
    xName: "x",
    yName: "y",
    name: "Deserts",
    width: "2",
    marker: { visible: true, width: 10, height: 10 },
    type: "Line",
  },
];

export const LinePrimaryXAxis = {
  valueType: 'DateTime',
  labelFormat: 'h:mm a',
  intervalType: 'Hours',
  edgeLabelPlacement: 'Shift',
  majorGridLines: { width: 0 },
  background: 'white',
};

export const LinePrimaryYAxis = {
  labelFormat: '{value}',
  rangePadding: 'None',
  minimum: 0,
  maximum: 50,
  interval: 5,
  lineStyle: { width: 0 },
  majorTickLines: { width: 0 },
  minorTickLines: { width: 0 },
};

// Best Employees
export const bestEmployees = [
  {
    icon: BsPerson,
    revenue: "+$2000",
    iconColor: '#33373E',
    desc: "Johnathan Doe",
    pcColor: "green-600",
    iconBg: '#E5FAFB',
  },
  {
    icon: BsPerson,
    revenue: "+$3000",
    iconColor: '#33373E',
    desc: "Peter Doe",
    pcColor: "green-600",
    iconBg: 'rgb(235, 250, 242)',
  },
  {
    icon: BsPerson,
    revenue: "+$4000",
    iconColor: '#33373E',
    desc: "Robert Doe",
    pcColor: "green-600",
    iconBg: 'rgb(254, 201, 15)',
  },
  {
    icon: BsPerson,
    revenue: "+$5000",
    iconColor: '#33373E',
    desc: "Jane Doe",
    pcColor: "green-600",
    iconBg: 'rgb(255, 244, 229)',
  },
  {
    icon: BsPerson,
    revenue: "+$5000",
    iconColor: '#33373E',
    desc: "Janette Doe",
    pcColor: "green-600",
    iconBg: 'rgb(254, 201, 15)',
  },
  {
    icon: BsPerson,
    revenue: "+$5000",
    iconColor: '#33373E',
    desc: "Petar Doe",
    pcColor: "green-600",
    iconBg: 'rgb(255, 244, 229)',
  },
  {
    icon: BsPerson,
    revenue: "+$5000",
    iconColor: '#33373E',
    desc: "AliS Doe",
    pcColor: "green-600",
    iconBg: 'rgb(254, 201, 15)',
  },
];

// Data for Pages/Menu

export const menuItems = [
  {
    title: "Chicken Alfredo",
    price: "$10",
    num_sold: "100",
    in_stock: "20",
    discount: "10%",
    label: "New",
  },
  {
    title: "Margherita Pizza",
    price: "$12",
    num_sold: "150",
    in_stock: "15",
    discount: "15%",
    label: "Bestseller",
  },
  {
    title: "Caesar Salad",
    price: "$8",
    num_sold: "200",
    in_stock: "30",
    discount: "5%",
    label: "Healthy",
  },
  {
    title: "Grilled Salmon",
    price: "$15",
    num_sold: "80",
    in_stock: "10",
    discount: "20%",
    label: "Special",
  },
  {
    title: "Beef Burger",
    price: "$11",
    num_sold: "220",
    in_stock: "25",
    discount: "10%",
    label: "Popular",
  },
  {
    title: "Vegan Bowl",
    price: "$9",
    num_sold: "130",
    in_stock: "18",
    discount: "10%",
    label: "Vegan",
  },
  {
    title: "Spaghetti Carbonara",
    price: "$10",
    num_sold: "175",
    in_stock: "22",
    discount: "12%",
    label: "Classic",
  },
  {
    title: "BBQ Chicken Wings",
    price: "$13",
    num_sold: "140",
    in_stock: "28",
    discount: "8%",
    label: "Hot",
  },
  {
    title: "Greek Salad",
    price: "$7",
    num_sold: "190",
    in_stock: "35",
    discount: "7%",
    label: "Fresh",
  },
  {
    title: "Tuna Sandwich",
    price: "$6",
    num_sold: "210",
    in_stock: "40",
    discount: "10%",
    label: "Light",
  },
  {
    title: "Pulled Pork Sandwich",
    price: "$9",
    num_sold: "115",
    in_stock: "12",
    discount: "15%",
    label: "Special",
  },
  {
    title: "Chicken Tacos",
    price: "$8",
    num_sold: "160",
    in_stock: "18",
    discount: "10%",
    label: "New",
  },
  {
    title: "Mushroom Risotto",
    price: "$14",
    num_sold: "95",
    in_stock: "9",
    discount: "20%",
    label: "Gourmet",
  },
  {
    title: "Cheeseburger",
    price: "$11",
    num_sold: "230",
    in_stock: "20",
    discount: "5%",
    label: "Popular",
  },
  {
    title: "Fish and Chips",
    price: "$12",
    num_sold: "170",
    in_stock: "25",
    discount: "10%",
    label: "Classic",
  },
  {
    title: "Penne Arrabbiata",
    price: "$9",
    num_sold: "180",
    in_stock: "16",
    discount: "12%",
    label: "Spicy",
  },
  {
    title: "Chicken Caesar Wrap",
    price: "$8",
    num_sold: "140",
    in_stock: "24",
    discount: "10%",
    label: "Healthy",
  },
  {
    title: "Lobster Bisque",
    price: "$16",
    num_sold: "70",
    in_stock: "8",
    discount: "15%",
    label: "Gourmet",
  },
  {
    title: "Veggie Burger",
    price: "$10",
    num_sold: "160",
    in_stock: "22",
    discount: "10%",
    label: "Vegan",
  },
  {
    title: "Shrimp Scampi",
    price: "$14",
    num_sold: "120",
    in_stock: "10",
    discount: "20%",
    label: "Special",
  },
  {
    title: "Steak Frites",
    price: "$18",
    num_sold: "85",
    in_stock: "12",
    discount: "15%",
    label: "Premium",
  },
  {
    title: "Eggplant Parmesan",
    price: "$11",
    num_sold: "110",
    in_stock: "14",
    discount: "10%",
    label: "Vegetarian",
  },
  {
    title: "Chicken Quesadilla",
    price: "$9",
    num_sold: "150",
    in_stock: "25",
    discount: "10%",
    label: "Spicy",
  },
  {
    title: "Tom Yum Soup",
    price: "$7",
    num_sold: "175",
    in_stock: "20",
    discount: "12%",
    label: "Hot",
  },
  {
    title: "Pesto Pasta",
    price: "$9",
    num_sold: "190",
    in_stock: "18",
    discount: "8%",
    label: "Fresh",
  },
  {
    title: "Falafel Plate",
    price: "$8",
    num_sold: "130",
    in_stock: "27",
    discount: "10%",
    label: "Vegan",
  },
  {
    title: "Chicken Fried Rice",
    price: "$10",
    num_sold: "220",
    in_stock: "30",
    discount: "5%",
    label: "Popular",
  },
  {
    title: "Buffalo Wings",
    price: "$13",
    num_sold: "165",
    in_stock: "15",
    discount: "10%",
    label: "Spicy",
  },
  {
    title: "Pad Thai",
    price: "$12",
    num_sold: "200",
    in_stock: "18",
    discount: "12%",
    label: "Classic",
  },
  {
    title: "Avocado Toast",
    price: "$7",
    num_sold: "190",
    in_stock: "22",
    discount: "10%",
    label: "Healthy",
  },
  {
    title: "Ribeye Steak",
    price: "$20",
    num_sold: "95",
    in_stock: "8",
    discount: "15%",
    label: "Premium",
  }
];




// FROM OLD PROJECT

export const earningData = [
  {
    icon: FaBowlFood,
    amount: '10',
    title: 'Trending Dishes',
    name: "Chicken Alfredo",
    iconColor: '#33373E',
    iconBg: '#E5FAFB',
    pcColor: 'red-600',
    bgColor: '#4bd391',
  },
  {
    icon: FaDollarSign,
    amount: '4,396',
    title: 'Total Income',
    iconColor: '#33373E',
    iconBg: 'rgb(254, 201, 15)',
    pcColor: 'green-600',
    bgColor: '#d58ce6',
  },
  {
    icon: AiOutlineShoppingCart,
    amount: '4236,39',
    percentage: '+38%',
    title: 'Total Orders',
    iconColor: '#33373E',
    iconBg: 'rgb(255, 244, 229)',
    pcColor: 'green-600',
    bgColor: '#ff7a67',
  },
];

export const pieChartData = [
  { x: 'Chicken Alfredo', y: 18, text: '18%' },
  { x: 'Pizza Margherita', y: 8, text: '8%' },
  { x: 'Berliner Kindl', y: 15, text: '15%' },
  { x: 'Apple Pie', y: 11, text: '11%' },
  { x: 'T-bone Steak', y: 18, text: '18%' },
  { x: 'Black Angus Steak', y: 14, text: '14%' },
  { x: 'Oysters', y: 16, text: '16%' },
];



export const barChartData = [
  [
    { x: 'Mon', y: 23 },
    { x: 'Tue', y: 27 },
    { x: 'Wed', y: 26 },
    { x: 'Thu', y: 30 },
    { x: 'Fri', y: 22 },
  ],
  [
    { x: 'Mon', y: 46 },
    { x: 'Tue', y: 26 },
    { x: 'Wed', y: 12 },
    { x: 'Thu', y: 32 },
    { x: 'Fri', y: 11 },
  ],
  [
    { x: 'Mon', y: 47 },
    { x: 'Tue', y: 24 },
    { x: 'Wed', y: 11 },
    { x: 'Thu', y: 25 },
    { x: 'Fri', y: 18 },
  ],
];

export const barCustomSeries = [
  {
    dataSource: barChartData[0],
    xName: 'x',
    yName: 'y',
    name: 'Peter Orders',
    type: 'Column',
    marker: {
      dataLabel: {
        visible: true,
        position: 'Top',
        font: { fontWeight: '600', color: '#ffffff' },
      },
    },
  },
  {
    dataSource: barChartData[1],
    xName: 'x',
    yName: 'y',
    name: 'Robert Orders',
    type: 'Column',
    marker: {
      dataLabel: {
        visible: true,
        position: 'Top',
        font: { fontWeight: '600', color: '#ffffff' },
      },
    },
  },
  {
    dataSource: barChartData[2],
    xName: 'x',
    yName: 'y',
    name: 'AliS Orders',
    type: 'Column',
    marker: {
      dataLabel: {
        visible: true,
        position: 'Top',
        font: { fontWeight: '600', color: '#ffffff' },
      },
    },
  },
];

export const barPrimaryXAxis = {
  valueType: 'Category',
  interval: 1,
  majorGridLines: { width: 0 },
};
export const barPrimaryYAxis = {
  majorGridLines: { width: 0 },
  majorTickLines: { width: 0 },
  lineStyle: { width: 0 },
  labelStyle: { color: 'transparent' },
};

export const medicalproBranding = {
  data: [
    {
      title: 'Due Date',
      desc: 'Oct 23, 2021',
    },
    {
      title: 'Budget',
      desc: '$98,500',
    },
    {
      title: 'Expense',
      desc: '$63,000',
    },
  ],
  teams: [
    {
      name: 'Bootstrap',
      color: 'orange',
    },
    {
      name: 'Angular',
      color: '#FB9678',
    },
  ],
  // leaders: [
  //   {
  //     image:
  //       avatar2,
  //   },
  //   {
  //     image:
  //       avatar3,
  //   },
  //   {
  //     image:
  //       avatar2,
  //   },
  //   {
  //     image:
  //       avatar4,
  //   },
  //   {
  //     image:
  //       avatar,
  //   },
  // ],
};

export const recentTransactions = [
  {
    icon: BsCurrencyDollar,
    amount: '+$350',
    title: 'Paypal Transfer',
    desc: 'Money Added',
    iconColor: '#03C9D7',
    iconBg: '#E5FAFB',
    pcColor: 'green-600',
  },
  {
    icon: BsShield,
    amount: '-$560',
    desc: 'Bill Payment',
    title: 'Wallet',
    iconColor: 'rgb(0, 194, 146)',
    iconBg: 'rgb(235, 250, 242)',
    pcColor: 'red-600',
  },
  {
    icon: FiCreditCard,
    amount: '+$350',
    title: 'Credit Card',
    desc: 'Money reversed',
    iconColor: 'rgb(255, 244, 229)',
    iconBg: 'rgb(254, 201, 15)',

    pcColor: 'green-600',
  },
  {
    icon: TiTick,
    amount: '+$350',
    title: 'Bank Transfer',
    desc: 'Money Added',

    iconColor: 'rgb(228, 106, 118)',
    iconBg: 'rgb(255, 244, 229)',
    pcColor: 'green-600',
  },
  {
    icon: BsCurrencyDollar,
    amount: '-$50',
    percentage: '+38%',
    title: 'Refund',
    desc: 'Payment Sent',
    iconColor: '#03C9D7',
    iconBg: '#E5FAFB',
    pcColor: 'red-600',
  },
];

export const weeklyStats = [
  {
    icon: FiShoppingCart,
    amount: '-$560',
    title: 'Top Sales',
    desc: 'Johnathan Doe',
    iconBg: '#FB9678',
    pcColor: 'red-600',
  },
  {
    icon: FiStar,
    amount: '-$560',
    title: 'Best Seller',
    desc: 'MaterialPro Admin',
    iconBg: 'rgb(254, 201, 15)',
    pcColor: 'red-600',
  },
  {
    icon: BsChatLeft,
    amount: '+$560',
    title: 'Most Commented',
    desc: 'Ample Admin',
    iconBg: '#00C292',
    pcColor: 'green-600',
  },
];

export const dropdownData = [
  {
    Id: '1',
    Time: 'March 2021',
  },
  {
    Id: '2',
    Time: 'April 2021',
  }, {
    Id: '3',
    Time: 'May 2021',
  },
];

export const SparklineAreaData = [
  { x: 1, yval: 2 },
  { x: 2, yval: 6 },
  { x: 3, yval: 8 },
  { x: 4, yval: 5 },
  { x: 5, yval: 10 },

];

export const ecomPieChartData = [
  { x: '2018', y: 18, text: '35%' },
  { x: '2019', y: 18, text: '15%' },
  { x: '2020', y: 18, text: '25%' },
  { x: '2021', y: 18, text: '25%' },
];

export const stackedChartData = [
  [
    { x: 'Mon', y: 111.1 },
    { x: 'Tue', y: 127.3 },
    { x: 'Wed', y: 143.4 },
    { x: 'Thu', y: 159.9 },
    { x: 'Fri', y: 159.9 },
  ],
  [
    { x: 'Mon', y: 150.1 },
    { x: 'Tue', y: 120.3 },
    { x: 'Wed', y: 163.4 },
    { x: 'Thu', y: 129.9 },
    { x: 'Fri', y: 129.9 },
  ],
  [
    { x: 'Mon', y: 110.1 },
    { x: 'Tue', y: 140.3 },
    { x: 'Wed', y: 123.4 },
    { x: 'Thu', y: 169.9 },
    { x: 'Fri', y: 149.9 },
  ],
  [
    { x: 'Mon', y: 100.1 },
    { x: 'Tue', y: 130.3 },
    { x: 'Wed', y: 127.4 },
    { x: 'Thu', y: 159.9 },
    { x: 'Fri', y: 189.9 },
  ],
];

export const stackedCustomSeries = [

  { dataSource: stackedChartData[0],
    xName: 'x',
    yName: 'y',
    name: 'Drinks',
    type: 'StackingBar',
    background: 'blue',

  },

  { dataSource: stackedChartData[1],
    xName: 'x',
    yName: 'y',
    name: 'Salads',
    type: 'StackingBar',
    background: 'red',

  },
  { dataSource: stackedChartData[2],
    xName: 'x',
    yName: 'y',
    name: 'Main Course',
    type: 'StackingBar',
    background: 'yellow',

  },
  { dataSource: stackedChartData[3],
    xName: 'x',
    yName: 'y',
    name: 'Desserts',
    type: 'StackingBar',
    background: 'pink',

  },

];

export const stackedPrimaryXAxis = {
  minorGridLines: { width: 0 },
  majorGridLines: { width: 0 },
  majorTickLines: { width: 0 },
  minorTickLines: { width: 0 },
  interval: 1,
  lineStyle: { width: 0 },
  labelIntersectAction: 'Rotate45',
  valueType: 'Category',
};

export const stackedPrimaryYAxis = {
  lineStyle: { width: 0 },
  minimum: 0,
  maximum: 800,
  interval: 100,
  majorTickLines: { width: 0 },
  majorGridLines: { width: 1 },
  minorGridLines: { width: 1 },
  minorTickLines: { width: 0 },
  labelFormat: '{value}',
};

export const ordersData = [
  {
    OrderID: 10248,
    CustomerName: 'Vinet',

    TotalAmount: 32.38,
    OrderItems: 'Fresh Tomato',
    Location: 'USA',
    Status: 'pending',
    StatusBg: '#FB9678',
   
  },
  {
    OrderID: 345653,
    CustomerName: 'Carson Darrin',
    TotalAmount: 56.34,
    OrderItems: 'Butter Scotch',
    Location: 'Delhi',
    Status: 'complete',
    StatusBg: '#8BE78B',
    
  },
  {
    OrderID: 390457,
    CustomerName: 'Fran Perez',
    TotalAmount: 93.31,
    OrderItems: 'Candy Gucci',
    Location: 'New York',
    Status: 'active',
    StatusBg: '#03C9D7',
  
  },
  {
    OrderID: 893486,
    CustomerName: 'Anika Viseer',
    TotalAmount: 93.31,
    OrderItems: 'Night Lamp',
    Location: 'Germany',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    
  },
  {
    OrderID: 748975,
    CustomerName: 'Miron Vitold',
    TotalAmount: 23.99,
    OrderItems: 'Healthcare Erbology',
    Location: 'Spain',
    Status: 'rejected',
    StatusBg: 'red',
    
  },
  {
    OrderID: 94757,
    CustomerName: 'Omar Darobe',
    TotalAmount: 95.99,
    OrderItems: 'Makeup Lancome Rouge',
    Location: 'USA',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    
  },
  {
    OrderID: 944895,
    CustomerName: 'Lulia albu',
    TotalAmount: 17.99,
    OrderItems: 'Skincare',
    Location: 'USA',
    Status: 'active',
    StatusBg: '#03C9D7',
    
  },
  {
    OrderID: 845954,
    CustomerName: 'Penjani',
    TotalAmount: 59.99,
    OrderItems: 'Headphone',
    Location: 'USA',
    Status: 'complete',
    StatusBg: '#8BE78B',
    
  },
  {
    OrderID: 845954,
    CustomerName: 'Jie Yan',
    TotalAmount: 87.99,
    OrderItems: 'Shoes',
    Location: 'USA',
    Status: 'pending',
    StatusBg: '#FB9678',
    ProductImage:
      'https://cdn.shopclues.com/images1/thumbnails/104158/320/320/148648730-104158193-1592481791.jpg',
  },
  {
    OrderID: 874534,
    CustomerName: 'Danai',
    TotalAmount: 122.99,
    OrderItems: 'Watch',
    Location: 'USA',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    ProductImage:
      'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/pop-womens-garmin-watches-1641919013.jpg?crop=0.502xw:1.00xh;0.250xw,0&resize=640:*',
  },
  {
    OrderID: 38489,
    CustomerName: 'Miron',
    TotalAmount: 87.99,
    OrderItems: 'Ice Cream',
    Location: 'USA',
    Status: 'active',
    StatusBg: '#03C9D7',
    ProductImage:
      'https://images.immediate.co.uk/production/volatile/sites/30/2020/08/dairy-free-ice-cream-eae372d.jpg',
  },
  {
    OrderID: 24546,
    CustomerName: 'Frank',
    TotalAmount: 84.99,
    OrderItems: 'Pan Cake',
    Location: 'Delhi',
    Status: 'complete',
    StatusBg: '#8BE78B',
    ProductImage:
      'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80',
  },
  {
    OrderID: 874534,
    CustomerName: 'Danai',
    TotalAmount: 122.99,
    OrderItems: 'Watch',
    Location: 'USA',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    ProductImage:
      'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/pop-womens-garmin-watches-1641919013.jpg?crop=0.502xw:1.00xh;0.250xw,0&resize=640:*',
  },
  {
    OrderID: 10248,
    CustomerName: 'Vinet',

    TotalAmount: 32.38,
    OrderItems: 'Fresh Tomato',
    Location: 'USA',
    Status: 'pending',
    StatusBg: '#FB9678',
   
  },
  {
    OrderID: 345653,
    CustomerName: 'Carson Darrin',
    TotalAmount: 56.34,
    OrderItems: 'Butter Scotch',
    Location: 'Delhi',
    Status: 'complete',
    StatusBg: '#8BE78B',
    
  },
  {
    OrderID: 390457,
    CustomerName: 'Fran Perez',
    TotalAmount: 93.31,
    OrderItems: 'Candy Gucci',
    Location: 'New York',
    Status: 'active',
    StatusBg: '#03C9D7',
    
  },
  {
    OrderID: 893486,
    CustomerName: 'Anika Viseer',
    TotalAmount: 93.31,
    OrderItems: 'Night Lamp',
    Location: 'Germany',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    
  },
  {
    OrderID: 748975,
    CustomerName: 'Miron Vitold',
    TotalAmount: 23.99,
    OrderItems: 'Healthcare Erbology',
    Location: 'Spain',
    Status: 'rejected',
    StatusBg: 'red',
    
  },
  {
    OrderID: 94757,
    CustomerName: 'Omar Darobe',
    TotalAmount: 95.99,
    OrderItems: 'Makeup Lancome Rouge',
    Location: 'USA',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    
  },
  {
    OrderID: 944895,
    CustomerName: 'Lulia albu',
    TotalAmount: 17.99,
    OrderItems: 'Skincare',
    Location: 'USA',
    Status: 'active',
    StatusBg: '#03C9D7',
    
  },
  {
    OrderID: 845954,
    CustomerName: 'Penjani',
    TotalAmount: 59.99,
    OrderItems: 'Headphone',
    Location: 'USA',
    Status: 'complete',
    StatusBg: '#8BE78B',
    
  },
  {
    OrderID: 845954,
    CustomerName: 'Jie Yan',
    TotalAmount: 87.99,
    OrderItems: 'Shoes',
    Location: 'USA',
    Status: 'pending',
    StatusBg: '#FB9678',
    ProductImage:
      'https://cdn.shopclues.com/images1/thumbnails/104158/320/320/148648730-104158193-1592481791.jpg',
  },
  {
    OrderID: 874534,
    CustomerName: 'Danai',
    TotalAmount: 122.99,
    OrderItems: 'Watch',
    Location: 'USA',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    ProductImage:
      'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/pop-womens-garmin-watches-1641919013.jpg?crop=0.502xw:1.00xh;0.250xw,0&resize=640:*',
  },
  {
    OrderID: 38489,
    CustomerName: 'Miron',
    TotalAmount: 87.99,
    OrderItems: 'Ice Cream',
    Location: 'USA',
    Status: 'active',
    StatusBg: '#03C9D7',
    ProductImage:
      'https://images.immediate.co.uk/production/volatile/sites/30/2020/08/dairy-free-ice-cream-eae372d.jpg',
  },
  {
    OrderID: 24546,
    CustomerName: 'Frank',
    TotalAmount: 84.99,
    OrderItems: 'Pan Cake',
    Location: 'Delhi',
    Status: 'complete',
    StatusBg: '#8BE78B',
    ProductImage:
      'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80',
  },
  {
    OrderID: 874534,
    CustomerName: 'Danai',
    TotalAmount: 122.99,
    OrderItems: 'Watch',
    Location: 'USA',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    ProductImage:
      'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/pop-womens-garmin-watches-1641919013.jpg?crop=0.502xw:1.00xh;0.250xw,0&resize=640:*',
  },
  {
    OrderID: 10248,
    CustomerName: 'Vinet',

    TotalAmount: 32.38,
    OrderItems: 'Fresh Tomato',
    Location: 'USA',
    Status: 'pending',
    StatusBg: '#FB9678',
    
  },
  {
    OrderID: 345653,
    CustomerName: 'Carson Darrin',
    TotalAmount: 56.34,
    OrderItems: 'Butter Scotch',
    Location: 'Delhi',
    Status: 'complete',
    StatusBg: '#8BE78B',
    
  },
  {
    OrderID: 390457,
    CustomerName: 'Fran Perez',
    TotalAmount: 93.31,
    OrderItems: 'Candy Gucci',
    Location: 'New York',
    Status: 'active',
    StatusBg: '#03C9D7',
    
  },
  {
    OrderID: 893486,
    CustomerName: 'Anika Viseer',
    TotalAmount: 93.31,
    OrderItems: 'Night Lamp',
    Location: 'Germany',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    
  },
  {
    OrderID: 748975,
    CustomerName: 'Miron Vitold',
    TotalAmount: 23.99,
    OrderItems: 'Healthcare Erbology',
    Location: 'Spain',
    Status: 'rejected',
    StatusBg: 'red',
    
  },
  {
    OrderID: 94757,
    CustomerName: 'Omar Darobe',
    TotalAmount: 95.99,
    OrderItems: 'Makeup Lancome Rouge',
    Location: 'USA',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    
  },
  {
    OrderID: 944895,
    CustomerName: 'Lulia albu',
    TotalAmount: 17.99,
    OrderItems: 'Skincare',
    Location: 'USA',
    Status: 'active',
    StatusBg: '#03C9D7',
   
  },
  {
    OrderID: 845954,
    CustomerName: 'Penjani',
    TotalAmount: 59.99,
    OrderItems: 'Headphone',
    Location: 'USA',
    Status: 'complete',
    StatusBg: '#8BE78B',
    
  },
  {
    OrderID: 845954,
    CustomerName: 'Jie Yan',
    TotalAmount: 87.99,
    OrderItems: 'Shoes',
    Location: 'USA',
    Status: 'pending',
    StatusBg: '#FB9678',
    ProductImage:
      'https://cdn.shopclues.com/images1/thumbnails/104158/320/320/148648730-104158193-1592481791.jpg',
  },
  {
    OrderID: 874534,
    CustomerName: 'Danai',
    TotalAmount: 122.99,
    OrderItems: 'Watch',
    Location: 'USA',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    ProductImage:
      'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/pop-womens-garmin-watches-1641919013.jpg?crop=0.502xw:1.00xh;0.250xw,0&resize=640:*',
  },
  {
    OrderID: 38489,
    CustomerName: 'Miron',
    TotalAmount: 87.99,
    OrderItems: 'Ice Cream',
    Location: 'USA',
    Status: 'active',
    StatusBg: '#03C9D7',
    ProductImage:
      'https://images.immediate.co.uk/production/volatile/sites/30/2020/08/dairy-free-ice-cream-eae372d.jpg',
  },
  {
    OrderID: 24546,
    CustomerName: 'Frank',
    TotalAmount: 84.99,
    OrderItems: 'Pan Cake',
    Location: 'Delhi',
    Status: 'complete',
    StatusBg: '#8BE78B',
    ProductImage:
      'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80',
  },
  {
    OrderID: 874534,
    CustomerName: 'Danai',
    TotalAmount: 122.99,
    OrderItems: 'Watch',
    Location: 'USA',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    ProductImage:
      'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/pop-womens-garmin-watches-1641919013.jpg?crop=0.502xw:1.00xh;0.250xw,0&resize=640:*',
  },
  {
    OrderID: 10248,
    CustomerName: 'Vinet',

    TotalAmount: 32.38,
    OrderItems: 'Fresh Tomato',
    Location: 'USA',
    Status: 'pending',
    StatusBg: '#FB9678',
    
  },
  {
    OrderID: 345653,
    CustomerName: 'Carson Darrin',
    TotalAmount: 56.34,
    OrderItems: 'Butter Scotch',
    Location: 'Delhi',
    Status: 'complete',
    StatusBg: '#8BE78B',
    
  },
  {
    OrderID: 390457,
    CustomerName: 'Fran Perez',
    TotalAmount: 93.31,
    OrderItems: 'Candy Gucci',
    Location: 'New York',
    Status: 'active',
    StatusBg: '#03C9D7',
    
  },
  {
    OrderID: 893486,
    CustomerName: 'Anika Viseer',
    TotalAmount: 93.31,
    OrderItems: 'Night Lamp',
    Location: 'Germany',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    
  },
  {
    OrderID: 748975,
    CustomerName: 'Miron Vitold',
    TotalAmount: 23.99,
    OrderItems: 'Healthcare Erbology',
    Location: 'Spain',
    Status: 'rejected',
    StatusBg: 'red',
    
  },
  {
    OrderID: 94757,
    CustomerName: 'Omar Darobe',
    TotalAmount: 95.99,
    OrderItems: 'Makeup Lancome Rouge',
    Location: 'USA',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    
  },
  {
    OrderID: 944895,
    CustomerName: 'Lulia albu',
    TotalAmount: 17.99,
    OrderItems: 'Skincare',
    Location: 'USA',
    Status: 'active',
    StatusBg: '#03C9D7',
    
  },
  {
    OrderID: 845954,
    CustomerName: 'Penjani',
    TotalAmount: 59.99,
    OrderItems: 'Headphone',
    Location: 'USA',
    Status: 'complete',
    StatusBg: '#8BE78B',
    
  },
  {
    OrderID: 845954,
    CustomerName: 'Jie Yan',
    TotalAmount: 87.99,
    OrderItems: 'Shoes',
    Location: 'USA',
    Status: 'pending',
    StatusBg: '#FB9678',
    ProductImage:
      'https://cdn.shopclues.com/images1/thumbnails/104158/320/320/148648730-104158193-1592481791.jpg',
  },
  {
    OrderID: 874534,
    CustomerName: 'Danai',
    TotalAmount: 122.99,
    OrderItems: 'Watch',
    Location: 'USA',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    ProductImage:
      'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/pop-womens-garmin-watches-1641919013.jpg?crop=0.502xw:1.00xh;0.250xw,0&resize=640:*',
  },
  {
    OrderID: 38489,
    CustomerName: 'Miron',
    TotalAmount: 87.99,
    OrderItems: 'Ice Cream',
    Location: 'USA',
    Status: 'active',
    StatusBg: '#03C9D7',
    ProductImage:
      'https://images.immediate.co.uk/production/volatile/sites/30/2020/08/dairy-free-ice-cream-eae372d.jpg',
  },
  {
    OrderID: 24546,
    CustomerName: 'Frank',
    TotalAmount: 84.99,
    OrderItems: 'Pan Cake',
    Location: 'Delhi',
    Status: 'complete',
    StatusBg: '#8BE78B',
    ProductImage:
      'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80',
  },
  {
    OrderID: 874534,
    CustomerName: 'Danai',
    TotalAmount: 122.99,
    OrderItems: 'Watch',
    Location: 'USA',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    ProductImage:
      'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/pop-womens-garmin-watches-1641919013.jpg?crop=0.502xw:1.00xh;0.250xw,0&resize=640:*',
  },
  {
    OrderID: 10248,
    CustomerName: 'Vinet',

    TotalAmount: 32.38,
    OrderItems: 'Fresh Tomato',
    Location: 'USA',
    Status: 'pending',
    StatusBg: '#FB9678',
    
  },
  {
    OrderID: 345653,
    CustomerName: 'Carson Darrin',
    TotalAmount: 56.34,
    OrderItems: 'Butter Scotch',
    Location: 'Delhi',
    Status: 'complete',
    StatusBg: '#8BE78B',
    
  },
  {
    OrderID: 390457,
    CustomerName: 'Fran Perez',
    TotalAmount: 93.31,
    OrderItems: 'Candy Gucci',
    Location: 'New York',
    Status: 'active',
    StatusBg: '#03C9D7',
    
  },
  {
    OrderID: 893486,
    CustomerName: 'Anika Viseer',
    TotalAmount: 93.31,
    OrderItems: 'Night Lamp',
    Location: 'Germany',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    
  },
  {
    OrderID: 748975,
    CustomerName: 'Miron Vitold',
    TotalAmount: 23.99,
    OrderItems: 'Healthcare Erbology',
    Location: 'Spain',
    Status: 'rejected',
    StatusBg: 'red',
    
  },
  {
    OrderID: 94757,
    CustomerName: 'Omar Darobe',
    TotalAmount: 95.99,
    OrderItems: 'Makeup Lancome Rouge',
    Location: 'USA',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    
  },
  {
    OrderID: 944895,
    CustomerName: 'Lulia albu',
    TotalAmount: 17.99,
    OrderItems: 'Skincare',
    Location: 'USA',
    Status: 'active',
    StatusBg: '#03C9D7',
    
  },
  {
    OrderID: 845954,
    CustomerName: 'Penjani',
    TotalAmount: 59.99,
    OrderItems: 'Headphone',
    Location: 'USA',
    Status: 'complete',
    StatusBg: '#8BE78B',
    
  },
  {
    OrderID: 845954,
    CustomerName: 'Jie Yan',
    TotalAmount: 87.99,
    OrderItems: 'Shoes',
    Location: 'USA',
    Status: 'pending',
    StatusBg: '#FB9678',
    ProductImage:
      'https://cdn.shopclues.com/images1/thumbnails/104158/320/320/148648730-104158193-1592481791.jpg',
  },
  {
    OrderID: 874534,
    CustomerName: 'Danai',
    TotalAmount: 122.99,
    OrderItems: 'Watch',
    Location: 'USA',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    ProductImage:
      'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/pop-womens-garmin-watches-1641919013.jpg?crop=0.502xw:1.00xh;0.250xw,0&resize=640:*',
  },
  {
    OrderID: 38489,
    CustomerName: 'Miron',
    TotalAmount: 87.99,
    OrderItems: 'Ice Cream',
    Location: 'USA',
    Status: 'active',
    StatusBg: '#03C9D7',
    ProductImage:
      'https://images.immediate.co.uk/production/volatile/sites/30/2020/08/dairy-free-ice-cream-eae372d.jpg',
  },
  {
    OrderID: 24546,
    CustomerName: 'Frank',
    TotalAmount: 84.99,
    OrderItems: 'Pan Cake',
    Location: 'Delhi',
    Status: 'complete',
    StatusBg: '#8BE78B',
    ProductImage:
      'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80',
  },
  {
    OrderID: 874534,
    CustomerName: 'Danai',
    TotalAmount: 122.99,
    OrderItems: 'Watch',
    Location: 'USA',
    Status: 'canceled',
    StatusBg: '#FF5C8E',
    ProductImage:
      'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/pop-womens-garmin-watches-1641919013.jpg?crop=0.502xw:1.00xh;0.250xw,0&resize=640:*',
  },
];

export const contextMenuItems = [
  'AutoFit',
  'AutoFitAll',
  'SortAscending',
  'SortDescending',
  'Copy',
  'Edit',
  'Delete',
  'Save',
  'Cancel',
  'PdfExport',
  'ExcelExport',
  'CsvExport',
  'FirstPage',
  'PrevPage',
  'LastPage',
  'NextPage',
];

export const ordersGrid = [
  {
    headerText: 'Image',
    textAlign: 'Center',
    width: '120',
  },
  {
    field: 'OrderItems',
    headerText: 'Item',
    width: '150',
    editType: 'dropdownedit',
    textAlign: 'Center',
  },
  { field: 'CustomerName',
    headerText: 'Customer Name',
    width: '150',
    textAlign: 'Center',
  },
  {
    field: 'TotalAmount',
    headerText: 'Total Amount',
    format: 'C2',
    textAlign: 'Center',
    editType: 'numericedit',
    width: '150',
  },
  {
    headerText: 'Status',
    field: 'OrderItems',
    textAlign: 'Center',
    width: '120',
  },
  {
    field: 'OrderID',
    headerText: 'Order ID',
    width: '120',
    textAlign: 'Center',
  },

  {
    field: 'Location',
    headerText: 'Location',
    width: '150',
    textAlign: 'Center',
  },
];

export const employeesData = [
  {
    EmployeeID: 1,
    Name: 'Nancy Davolio',
    Title: 'Sales Representative',
    HireDate: '01/02/2021',
    Country: 'USA',
    ReportsTo: 'Carson',
  },
  {
    EmployeeID: 2,
    Name: 'Nasimiyu Danai',
    Title: 'Marketing Head',
    HireDate: '01/02/2021',
    Country: 'USA',
    ReportsTo: 'Carson',
  },
  {
    EmployeeID: 3,
    Name: 'Iulia Albu',
    Title: 'HR',
    HireDate: '01/02/2021',
    Country: 'USA',
    ReportsTo: 'Carson',
  },
  {
    EmployeeID: 4,
    Name: 'Siegbert Gottfried',
    Title: 'Marketing Head',
    HireDate: '01/02/2021',
    Country: 'USA',
    ReportsTo: 'Carson',
  },
  {
    EmployeeID: 5,
    Name: 'Omar Darobe',
    Title: 'HR',
    HireDate: '01/02/2021',
    Country: 'USA',
    ReportsTo: 'Carson',
  },
  {
    EmployeeID: 4,
    Name: 'Penjani Inyene',
    Title: 'Marketing Head',
    HireDate: '01/02/2021',
    Country: 'USA',
    ReportsTo: 'Carson',
  },
  {
    EmployeeID: 5,
    Name: 'Miron Vitold',
    Title: 'HR',
    HireDate: '01/02/2021',
    Country: 'USA',
    ReportsTo: 'Carson',
  },
  {
    EmployeeID: 1,
    Name: 'Nancy Davolio',
    Title: 'Sales Representative',
    HireDate: '01/02/2021',
    Country: 'USA',
    ReportsTo: 'Carson',
  },
  {
    EmployeeID: 2,
    Name: 'Nasimiyu Danai',
    Title: 'Marketing Head',
    HireDate: '01/02/2021',
    Country: 'USA',
    ReportsTo: 'Carson',
  },
  {
    EmployeeID: 3,
    Name: 'Iulia Albu',
    Title: 'HR',
    HireDate: '01/02/2021',
    Country: 'USA',
    ReportsTo: 'Carson',
  },
  {
    EmployeeID: 4,
    Name: 'Siegbert Gottfried',
    Title: 'Marketing Head',
    HireDate: '01/02/2021',
    Country: 'USA',
    ReportsTo: 'Carson',
  },
  {
    EmployeeID: 5,
    Name: 'Omar Darobe',
    Title: 'HR',
    HireDate: '01/02/2021',
    Country: 'USA',
    ReportsTo: 'Carson',
  },
  {
    EmployeeID: 4,
    Name: 'Penjani Inyene',
    Title: 'Marketing Head',
    HireDate: '01/02/2021',
    Country: 'USA',
    ReportsTo: 'Carson',
  },
  {
    EmployeeID: 5,
    Name: 'Miron Vitold',
    Title: 'HR',
    HireDate: '01/02/2021',
    Country: 'USA',
    ReportsTo: 'Carson',
  },
  {
    EmployeeID: 1,
    Name: 'Nancy Davolio',
    Title: 'Sales Representative',
    HireDate: '01/02/2021',
    Country: 'USA',
    ReportsTo: 'Carson',
  },
  {
    EmployeeID: 2,
    Name: 'Nasimiyu Danai',
    Title: 'Marketing Head',
    HireDate: '01/02/2021',
    Country: 'USA',
    ReportsTo: 'Carson',
  },
  {
    EmployeeID: 3,
    Name: 'Iulia Albu',
    Title: 'HR',
    HireDate: '01/02/2021',
    Country: 'USA',
    ReportsTo: 'Carson',
  },
];


export const employeesGrid = [
  { headerText: 'Employee',
    width: '150',
    textAlign: 'Center' },
  { field: 'Name',
    headerText: '',
    width: '0',
    textAlign: 'Center',
  },
  { field: 'Title',
    headerText: 'Designation',
    width: '170',
    textAlign: 'Center',
  },
  { headerText: 'Country',
    width: '120',
    textAlign: 'Center',
  },

  { field: 'HireDate',
    headerText: 'Hire Date',
    width: '135',
    format: 'yMd',
    textAlign: 'Center' },

  { field: 'ReportsTo',
    headerText: 'Reports To',
    width: '120',
    textAlign: 'Center' },
  { field: 'EmployeeID',
    headerText: 'Employee ID',
    width: '125',
    textAlign: 'Center' },
];

export const userProfileData = [
  {
    icon: BsCurrencyDollar,
    title: 'My Profile',
    desc: 'Account Settings',
    iconColor: '#03C9D7',
    iconBg: '#E5FAFB',
  },
  {
    icon: BsShield,
    title: 'My Inbox',
    desc: 'Messages & Emails',
    iconColor: 'rgb(0, 194, 146)',
    iconBg: 'rgb(235, 250, 242)',
  },
  {
    icon: FiCreditCard,
    title: 'My Tasks',
    desc: 'To-do and Daily Tasks',
    iconColor: 'rgb(255, 244, 229)',
    iconBg: 'rgb(254, 201, 15)',
  },
];

export const chatData = [
  {
    message: 'Order N123 has been changed',
    desc: 'View order',
    time: '9:08 AM',
  },
  {
    message: 'New order received',
    desc: 'View order',
    time: '11:56 AM',
  },
  {
    message: 'New Payment received',
    desc: 'View order',
    time: '4:39 AM',
  },
  {
    message: 'New item added to the menu',
    desc: 'View item',
    time: '1:12 AM',
  },
];

export const scheduleData = [
  {
    Id: 1,
    Subject: 'Staff Meeting',
    Location: 'Conference Room',
    StartTime: '2024-08-18T09:00:00.000Z',
    EndTime: '2024-08-18T10:00:00.000Z',
    CategoryColor: '#1aaa55',
  },
  {
    Id: 2,
    Subject: 'Inventory Check',
    Location: 'Storage Area',
    StartTime: '2024-08-19T08:30:00.000Z',
    EndTime: '2024-08-19T11:00:00.000Z',
    CategoryColor: '#357cd2',
  },
  {
    Id: 3,
    Subject: 'Kitchen Staff Training',
    Location: 'Kitchen',
    StartTime: '2024-08-20T14:00:00.000Z',
    EndTime: '2024-08-20T16:00:00.000Z',
    CategoryColor: '#7fa900',
  },
  {
    Id: 4,
    Subject: 'Health & Safety Inspection',
    Location: 'Restaurant Premises',
    StartTime: '2024-08-21T10:30:00.000Z',
    EndTime: '2024-08-21T12:00:00.000Z',
    CategoryColor: '#ea7a57',
  },
  {
    Id: 5,
    Subject: 'New Menu Planning',
    Location: 'Manager\'s Office',
    StartTime: '2024-08-22T11:00:00.000Z',
    EndTime: '2024-08-22T13:00:00.000Z',
    CategoryColor: '#00bdae',
  },
  {
    Id: 6,
    Subject: 'Vendor Meeting',
    Location: 'Meeting Room 2',
    StartTime: '2024-08-23T09:30:00.000Z',
    EndTime: '2024-08-23T10:30:00.000Z',
    CategoryColor: '#f57f17',
  },
  {
    Id: 7,
    Subject: 'Customer Feedback Review',
    Location: 'Manager\'s Office',
    StartTime: '2024-08-24T15:00:00.000Z',
    EndTime: '2024-08-24T16:00:00.000Z',
    CategoryColor: '#1aaa55',
  },
  {
    Id: 8,
    Subject: 'Staff Scheduling',
    Location: 'Manager\'s Office',
    StartTime: '2024-08-25T13:00:00.000Z',
    EndTime: '2024-08-25T14:30:00.000Z',
    CategoryColor: '#357cd2',
  },
  {
    Id: 9,
    Subject: 'Weekly Sales Analysis',
    Location: 'Manager\'s Office',
    StartTime: '2024-08-26T10:00:00.000Z',
    EndTime: '2024-08-26T12:00:00.000Z',
    CategoryColor: '#7fa900',
  },
  {
    Id: 10,
    Subject: 'Team Building Activity',
    Location: 'Outdoor Area',
    StartTime: '2024-08-27T16:00:00.000Z',
    EndTime: '2024-08-27T18:00:00.000Z',
    CategoryColor: '#ea7a57',
  },
  {
    Id: 11,
    Subject: 'New Hire Orientation',
    Location: 'Training Room',
    StartTime: '2024-08-28T09:00:00.000Z',
    EndTime: '2024-08-28T11:00:00.000Z',
    CategoryColor: '#00bdae',
  },
  {
    Id: 12,
    Subject: 'Monthly Budget Review',
    Location: 'Manager\'s Office',
    StartTime: '2024-08-29T14:00:00.000Z',
    EndTime: '2024-08-29T16:00:00.000Z',
    CategoryColor: '#f57f17',
  }
];

export const kanbanData = [
  {
    Id: 'Task 1',
    Title: 'Task - 101',
    Status: 'Open',
    Summary: 'Schedule staff for the upcoming week.',
    Type: 'Staffing',
    Priority: 'High',
    Tags: 'Scheduling,Staffing',
    Estimate: 2,
    Assignee: 'Alice Johnson',
    RankId: 1,
    Color: '#FFA726',
    ClassName: 'e-staffing, e-high, e-alice-johnson',
  },
  {
    Id: 'Task 2',
    Title: 'Task - 102',
    Status: 'InProgress',
    Summary: 'Order fresh produce for the weekend rush.',
    Type: 'Procurement',
    Priority: 'Critical',
    Tags: 'Inventory,Procurement',
    Estimate: 1.5,
    Assignee: 'Bob Smith',
    RankId: 1,
    Color: '#EF5350',
    ClassName: 'e-procurement, e-critical, e-bob-smith',
  },
  {
    Id: 'Task 3',
    Title: 'Task - 103',
    Status: 'Open',
    Summary: 'Review and update the menu for seasonal changes.',
    Type: 'Menu',
    Priority: 'Normal',
    Tags: 'Menu,Update',
    Estimate: 3,
    Assignee: 'Charlie Davis',
    RankId: 2,
    Color: '#42A5F5',
    ClassName: 'e-menu, e-normal, e-charlie-davis',
  },
  {
    Id: 'Task 4',
    Title: 'Task - 104',
    Status: 'InProgress',
    Summary: 'Conduct training for new hires on kitchen safety.',
    Type: 'Training',
    Priority: 'High',
    Tags: 'Training,Safety',
    Estimate: 4,
    Assignee: 'Diana Miller',
    RankId: 2,
    Color: '#66BB6A',
    ClassName: 'e-training, e-high, e-diana-miller',
  },
  {
    Id: 'Task 5',
    Title: 'Task - 105',
    Status: 'Review',
    Summary: 'Audit the monthly expenses.',
    Type: 'Finance',
    Priority: 'Normal',
    Tags: 'Audit,Expenses',
    Estimate: 2.5,
    Assignee: 'Ethan Wilson',
    RankId: 1,
    Color: '#AB47BC',
    ClassName: 'e-finance, e-normal, e-ethan-wilson',
  },
  {
    Id: 'Task 6',
    Title: 'Task - 106',
    Status: 'Validate',
    Summary: 'Ensure compliance with health inspection standards.',
    Type: 'Compliance',
    Priority: 'Critical',
    Tags: 'Health,Inspection',
    Estimate: 1,
    Assignee: 'Fiona Garcia',
    RankId: 1,
    Color: '#FF7043',
    ClassName: 'e-compliance, e-critical, e-fiona-garcia',
  },
  {
    Id: 'Task 7',
    Title: 'Task - 107',
    Status: 'Review',
    Summary: 'Prepare payroll for staff.',
    Type: 'Finance',
    Priority: 'High',
    Tags: 'Payroll,Staff',
    Estimate: 2,
    Assignee: 'George White',
    RankId: 2,
    Color: '#29B6F6',
    ClassName: 'e-finance, e-high, e-george-white',
  },
  {
    Id: 'Task 8',
    Title: 'Task - 108',
    Status: 'Close',
    Summary: 'Evaluate feedback from customers for the month.',
    Type: 'Feedback',
    Priority: 'Low',
    Tags: 'Customer,Feedback',
    Estimate: 1.5,
    Assignee: 'Hannah Brown',
    RankId: 3,
    Color: '#FFCA28',
    ClassName: 'e-feedback, e-low, e-hannah-brown',
  },
  {
    Id: 'Task 9',
    Title: 'Task - 109',
    Status: 'Validate',
    Summary: 'Validate inventory levels after weekend rush.',
    Type: 'Inventory',
    Priority: 'Normal',
    Tags: 'Inventory,Validation',
    Estimate: 1,
    Assignee: 'Ian Thompson',
    RankId: 1,
    Color: '#8D6E63',
    ClassName: 'e-inventory, e-normal, e-ian-thompson',
  },
  {
    Id: 'Task 10',
    Title: 'Task - 110',
    Status: 'Open',
    Summary: 'Plan marketing strategy for the upcoming holiday season.',
    Type: 'Marketing',
    Priority: 'High',
    Tags: 'Marketing,Strategy',
    Estimate: 4.5,
    Assignee: 'Jane Lee',
    RankId: 3,
    Color: '#26C6DA',
    ClassName: 'e-marketing, e-high, e-jane-lee',
  },
  {
    Id: 'Task 11',
    Title: 'Task - 111',
    Status: 'InProgress',
    Summary: 'Fix issues with the online reservation system.',
    Type: 'IT',
    Priority: 'Critical',
    Tags: 'IT,Reservations',
    Estimate: 3,
    Assignee: 'Kevin Wright',
    RankId: 4,
    Color: '#EF5350',
    ClassName: 'e-it, e-critical, e-kevin-wright',
  },
  {
    Id: 'Task 12',
    Title: 'Task - 112',
    Status: 'Review',
    Summary: 'Review the supplier contracts for the next quarter.',
    Type: 'Procurement',
    Priority: 'Normal',
    Tags: 'Suppliers,Contracts',
    Estimate: 3,
    Assignee: 'Laura Moore',
    RankId: 4,
    Color: '#AB47BC',
    ClassName: 'e-procurement, e-normal, e-laura-moore',
  },
  {
    Id: 'Task 13',
    Title: 'Task - 113',
    Status: 'Close',
    Summary: 'Update the staff handbook with new policies.',
    Type: 'Policy',
    Priority: 'Low',
    Tags: 'HR,Policy',
    Estimate: 2,
    Assignee: 'Michael Scott',
    RankId: 4,
    Color: '#FFA726',
    ClassName: 'e-policy, e-low, e-michael-scott',
  },
  {
    Id: 'Task 14',
    Title: 'Task - 114',
    Status: 'Validate',
    Summary: 'Validate the quality of food before dinner service.',
    Type: 'Quality Control',
    Priority: 'Critical',
    Tags: 'Quality,Food',
    Estimate: 1,
    Assignee: 'Nina Clark',
    RankId: 1,
    Color: '#FF7043',
    ClassName: 'e-quality-control, e-critical, e-nina-clark',
  },
  {
    Id: 'Task 15',
    Title: 'Task - 115',
    Status: 'Close',
    Summary: 'Analyze sales data for the previous month.',
    Type: 'Finance',
    Priority: 'High',
    Tags: 'Sales,Analysis',
    Estimate: 3.5,
    Assignee: 'Oscar Harris',
    RankId: 5,
    Color: '#29B6F6',
    ClassName: 'e-finance, e-high, e-oscar-harris',
  },
  {
    Id: 'Task 16',
    Title: 'Task - 116',
    Status: 'Close',
    Summary: 'Set up the new point-of-sale system.',
    Type: 'IT',
    Priority: 'Critical',
    Tags: 'POS,Setup',
    Estimate: 5,
    Assignee: 'Paul Martinez',
    RankId: 6,
    Color: '#EF5350',
    ClassName: 'e-it, e-critical, e-paul-martinez',
  },
  {
    Id: 'Task 17',
    Title: 'Task - 117',
    Status: 'Validate',
    Summary: 'Validate customer feedback responses.',
    Type: 'Feedback',
    Priority: 'Normal',
    Tags: 'Customer,Validation',
    Estimate: 2,
    Assignee: 'Quinn Adams',
    RankId: 2,
    Color: '#FFCA28',
    ClassName: 'e-feedback, e-normal, e-quinn-adams',
  },
  {
    Id: 'Task 18',
    Title: 'Task - 118',
    Status: 'InProgress',
    Summary: 'Improve the online ordering system.',
    Type: 'IT',
    Priority: 'High',
    Tags: 'IT,Ordering',
    Estimate: 4,
    Assignee: 'Rachel King',
    RankId: 7,
    Color: '#42A5F5',
    ClassName: 'e-it, e-high, e-rachel-king',
  },
  {
    Id: 'Task 19',
    Title: 'Task - 119',
    Status: 'Review',
    Summary: 'Test the new seasonal menu.',
    Type: 'Menu',
    Priority: 'High',
    Tags: 'Menu,Test',
    Estimate: 3,
    Assignee: 'Sam Taylor',
    RankId: 3,
    Color: '#66BB6A',
    ClassName: 'e-menu, e-high, e-sam-taylor',
  },
  {
    Id: 'Task 20',
    Title: 'Task - 120',
    Status: 'Open',
    Summary: 'Enhance the customer loyalty program.',
    Type: 'Marketing',
    Priority: 'Normal',
    Tags: 'Marketing,Loyalty',
    Estimate: 3,
    Assignee: 'Tina Walker',
    RankId: 5,
    Color: '#26C6DA',
    ClassName: 'e-marketing, e-normal, e-tina-walker',
  }
];

export const kanbanGrid = [
  { headerText: 'To Do',
    keyField: 'Open',
    allowToggle: true },

  { headerText: 'In Progress',
    keyField: 'InProgress',
    allowToggle: true },

  { headerText: 'Testing',
    keyField: 'Testing',
    allowToggle: true,
    isExpanded: false },

  { headerText: 'Done',
    keyField: 'Close',
    allowToggle: true },
];

export const themeColors = [
  {
    name: 'blue-theme',
    color: '#1A97F5',
  },
  {
    name: 'green-theme',
    color: '#03C9D7',
  },
  {
    name: 'purple-theme',
    color: '#7352FF',
  },
  {
    name: 'red-theme',
    color: '#FF5C8E',
  },
  {
    name: 'indigo-theme',
    color: '#1E4DB7',
  },
  {
    color: '#FB9678',
    name: 'orange-theme',
  },
];