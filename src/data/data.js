import React from "react";
import { FiBarChart2, FiTrendingUp, FiPieChart, FiCreditCard, FiStar, FiShoppingCart } from "react-icons/fi";
import { FaMedal } from "react-icons/fa";
import { GiHotMeal } from "react-icons/gi";
import { MdOutlineQrCode2 } from "react-icons/md";
import { AiOutlineFileText, AiOutlineCalendar, AiOutlineShoppingCart } from "react-icons/ai";
import { FaBowlFood } from "react-icons/fa6";
import { BsPerson, BsCurrencyDollar, BsShield, BsChatLeft, BsKanban } from "react-icons/bs";
import { MdRestaurantMenu, MdOutlineTableRestaurant } from "react-icons/md";
import { IoMdPeople } from "react-icons/io";
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
      {
        name: "QRCodeGenerator",
        label: "QRCode Generator",
        icon: MdOutlineQrCode2,
      },
    ],
  },
];

// for Daily Sales Chart
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

// for Daily Sales chart
export const LinePrimaryXAxis = {
  valueType: 'DateTime',
  labelFormat: 'h:mm a',
  intervalType: 'Hours',
  edgeLabelPlacement: 'Shift',
  majorGridLines: { width: 0 },
  background: 'white',
};

// for Daily Sales chart
export const LinePrimaryYAxis = {
  labelFormat: '{value}',
  rangePadding: 'None',
  minimum: 0,
  maximum: 20,
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
];

// for Overview
export const categorizedData = {
  "Alcoholic Beverages": [],
  "Non-Alcoholic Beverages": [],
  "Main Course": [],
  Salads: [],
  Desserts: [],
};

// for Overview
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
    title: 'Total Income',
    iconColor: '#33373E',
    iconBg: 'rgb(254, 201, 15)',
    pcColor: 'green-600',
    bgColor: '#d58ce6',
  },
  {
    icon: AiOutlineShoppingCart,
    title: 'Total Orders',
    iconColor: '#33373E',
    iconBg: 'rgb(255, 244, 229)',
    pcColor: 'green-600',
    bgColor: '#ff7a67',
  },
];

// for Overview
export const chartData = [
  {
    dataSource: categorizedData["Alcoholic Beverages"],
  xName: "x",
  yName: "y",
  name: "Alcoholic Beverages",
  width: "2",
  marker: { visible: true, width: 10, height: 10 },
  type: "Line",
  },
  {
    dataSource: categorizedData["Non-Alcoholic Beverages"],
    xName: "x",
    yName: "y",
    name: "Non-Alcoholic Beverages",
    width: "2",
    marker: { visible: true, width: 10, height: 10 },
    type: "Line",
  },
  {
    dataSource: categorizedData["Main Course"],
    xName: "x",
    yName: "y",
    name: "Main Course",
    width: "2",
    marker: { visible: true, width: 10, height: 10 },
    type: "Line",
  },
  {
    dataSource: categorizedData.Salads,
    xName: "x",
    yName: "y",
    name: "Salads",
    width: "2",
    marker: { visible: true, width: 10, height: 10 },
    type: "Line",
  },
  {
    dataSource: categorizedData.Desserts,
    xName: "x",
    yName: "y",
    name: "Desserts",
    width: "2",
    marker: { visible: true, width: 10, height: 10 },
    type: "Line",
  },
];

// for Dashboard/Trending Dishes
export const pieChartData = [
  { x: 'Chicken Alfredo', y: 18, text: '18%' },
  { x: 'Pizza Margherita', y: 8, text: '8%' },
  { x: 'Berliner Kindl', y: 15, text: '15%' },
  { x: 'Apple Pie', y: 11, text: '11%' },
  { x: 'T-bone Steak', y: 18, text: '18%' },
  { x: 'Black Angus Steak', y: 14, text: '14%' },
  { x: 'Oysters', y: 16, text: '16%' },
];


// Dashboard/Best Employees
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

// Dashboard/Best Employees
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
    name: 'John Orders',
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

// Dashboard/Best Employees
export const barPrimaryXAxis = {
  valueType: 'Category',
  interval: 1,
  majorGridLines: { width: 0 },
};

// Dashboard/Best Employees
export const barPrimaryYAxis = {
  majorGridLines: { width: 0 },
  majorTickLines: { width: 0 },
  lineStyle: { width: 0 },
  labelStyle: { color: 'transparent' },
};

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

// for Pages/Total Orders
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

// for Pages/Total Orders
export const stackedCustomSeries = [

  { dataSource: stackedChartData[0],
    xName: 'x',
    yName: 'y',
    name: 'Alcoholic Beverages',
    type: 'StackingBar',
    background: 'green',
  },
  { dataSource: stackedChartData[0],
    xName: 'x',
    yName: 'y',
    name: 'Non-Alcoholic Beverages',
    type: 'StackingBar',
    background: 'yellow',
  },
  { dataSource: stackedChartData[0],
    xName: 'x',
    yName: 'y',
    name: 'Main Course',
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

  { dataSource: stackedChartData[3],
    xName: 'x',
    yName: 'y',
    name: 'Desserts',
    type: 'StackingBar',
    background: 'pink',
  },

];

// for Pages/Total Orders
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

// for Pages/Total Orders
export const stackedPrimaryYAxis = {
  lineStyle: { width: 0 },
  minimum: 0,
  maximum: 900,
  interval: 80,
  majorTickLines: { width: 0 },
  majorGridLines: { width: 1 },
  minorGridLines: { width: 1 },
  minorTickLines: { width: 0 },
  labelFormat: '{value}',
};

// export const contextMenuItems = [
//   'AutoFit',
//   'AutoFitAll',
//   'SortAscending',
//   'SortDescending',
//   'Copy',
//   'Edit',
//   'Delete',
//   'Save',
//   'Cancel',
//   'PdfExport',
//   'ExcelExport',
//   'CsvExport',
//   'FirstPage',
//   'PrevPage',
//   'LastPage',
//   'NextPage',
// ];




// for UserProfile

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

// for Notifications
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

// for Calendar
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

// for Kanban
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

// for Kanban
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

// for ThemeSettings
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

// Table Colors
export const tableColors = [
  "rgb(75, 211, 145)",
  "rgb(213, 140, 230)",
  "rgb(255, 122, 103)",
  "rgb(102, 153, 255)",
  "rgb(255, 189, 68)",
  "rgb(144, 224, 239)",
  "rgb(255, 105, 180)",
];