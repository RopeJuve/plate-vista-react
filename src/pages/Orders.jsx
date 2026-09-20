import React, { useState, useEffect } from "react";
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Inject,Search, Sort, Toolbar } from "@syncfusion/ej2-react-grids";
import { useStateContext } from "../contexts/ContextProvider";
import { fetchOrders } from "../services/orderDataFetch";
import { Header } from "../Components/AdminComponents";
import { DropDownButtonComponent } from '@syncfusion/ej2-react-splitbuttons';
import { ORDER_STATUS } from "../constants/orderStatus";
import { notify } from "../utils/notify";

const PAGE_SIZE = 20;

const transformOrders = (orders = []) =>
  orders.map((order) => {
    const menuItemsDetails = (order.menuItems || [])
      .filter((item) => item.product)
      .map((item) => ({
        title: item.product?.title ?? "Unavailable item",
        quantity: item?.quantity,
      }));

    const totalQuantity = menuItemsDetails.reduce(
      (acc, item) => acc + (item.quantity || 0),
      0
    );

    return {
      user: order.user ? order.user.username : "Guest User",
      menuItems: menuItemsDetails,
      quantity: totalQuantity,
      totalPrice: order.totalPrice,
      orderStatus: order.orderStatus,
      location: order.tableNumber ?? order.table?.tableNumber ?? "",
      orderId: order._id,
    };
  });

const Orders = () => {
  const { currentColor } = useStateContext();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const loadOrders = (page) => {
    fetchOrders({ page, limit: PAGE_SIZE })
      .then((response) => {
        const pageOrders = response.data?.orders ?? [];
        setOrders(transformOrders(pageOrders));
        setTotal(response.data?.total ?? pageOrders.length);
        setCurrentPage(response.data?.page ?? page);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
        notify(error.response?.data?.message || "Could not load orders");
      });
  };

  useEffect(() => {
    loadOrders(1);
  }, []);

  const handleDataStateChange = (state) => {
    const nextPage = Math.floor((state.skip || 0) / (state.take || PAGE_SIZE)) + 1;
    loadOrders(nextPage);
  };

  const toolbarOptions = ["Search"];

  
  const menuItemsTemplate = (props) => {
    const menuItems = props.menuItems || [];

    if (menuItems.length === 0) {
      return <span>Unavailable item</span>;
    }

    if (menuItems.length > 1) {
      
      const dropdownItems = menuItems.map((item) => ({
        text: `${item.title} (${item.quantity})`,
      }));

      return (
        <DropDownButtonComponent
          items={dropdownItems}
          content="See products"
        />
      );
    } else {

      return (
        <span>
          {menuItems[0]?.title ?? "Unavailable item"}
        </span>
      );
    }
  };

    
    const statusColorTemplate = (props) => {
      const statusColorClasses = {
        [ORDER_STATUS.PROCESSING]: "bg-red-500 text-gray-100",
        [ORDER_STATUS.PENDING]: "bg-orange-500 text-gray-100",
        [ORDER_STATUS.COMPLETE]: "bg-green-500 text-gray-100",
      };
    
      const statusClasses = statusColorClasses[props.orderStatus]
    
      return (
        <div
          className={`inline-block text-center rounded-full px-2 py-2 ${statusClasses}`}
        >
          {props.orderStatus}
        </div>
      );
    };
    

  return (
    <div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-d-main-bg rounded-3xl shadow-lg transition-colors duration-300 ease-in-out">
      
      <Header title="Orders" />
      <GridComponent
        dataSource={{ result: orders, count: total }}
        allowPaging={true}
        allowSorting={true}
        toolbar={toolbarOptions}
        pageSettings={{ pageSize: PAGE_SIZE, currentPage }}
        dataStateChange={handleDataStateChange}
        style={{ backgroundColor: currentColor }}
      >
        <ColumnsDirective>
          <ColumnDirective
            field="user"
            headerText="User"
            textAlign="Center"
            width="150"
          />
          <ColumnDirective
            field="menuItems"
            headerText="Menu Items"
            textAlign="Center"
            width="300"
            template={menuItemsTemplate}
          />
          <ColumnDirective
            field="quantity"
            headerText="Quantity"
            textAlign="Center"
            width="100"
          />
          <ColumnDirective
            field="totalPrice"
            headerText="Total Price"
            textAlign="Center"
            width="120"
          />
          <ColumnDirective
            field="orderStatus"
            headerText="Order Status"
            textAlign="Center"
            width="150"
            template={statusColorTemplate}
          />
          <ColumnDirective
            field="location"
            headerText="Location"
            textAlign="Center"
            width="150"
          />
          <ColumnDirective
            field="orderId"
            headerText="Order ID"
            textAlign="Center"
            width="150"
          />
        </ColumnsDirective>
        <Inject services={[Page, Sort, Search, Toolbar]} />
      </GridComponent>
    </div>
  );
};



export default Orders;
