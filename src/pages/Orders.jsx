import React, { useState, useEffect } from "react";
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Inject,Search, Sort, Toolbar } from "@syncfusion/ej2-react-grids";
import { useStateContext } from "../contexts/ContextProvider";
import { fetchOrders } from "../services/orderDataFetch";
import { Header } from "../components/AdminComponents";
import { DropDownButtonComponent } from '@syncfusion/ej2-react-splitbuttons';

const Orders = () => {
  const { currentColor } = useStateContext();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders()
      .then((response) => {
        // Here I check if data is coming from the API
        console.log("API response data:", response.data);

        const transformedOrders = response.data.map((order) => {
 
          const menuItemsDetails = order.menuItems.map((item) => ({
            title: item.product.title,
            quantity: item.quantity,
          }));

          const totalQuantity = menuItemsDetails.reduce((acc, item) => acc + item.quantity, 0);

          return {
            user: order.user ? order.user.username : "Guest User",
            menuItems: menuItemsDetails,
            quantity: totalQuantity,
            totalPrice: order.totalPrice,
            orderStatus: order.orderStatus,
            location: "Germany", // Hardcoded for now
            orderId: "1234567", // Hardcoded for now
          };
        });
        setOrders(transformedOrders);
      })
      .catch((error) => {
        console.error("Error fetching orders:", error);
      });
  }, []);

  const toolbarOptions = ["Search"];

  
  const menuItemsTemplate = (props) => {
    const menuItems = props.menuItems;

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
          {menuItems[0].title}
        </span>
      );
    }
  };

    
    const statusColorMap = {
    "Processing": "#FF0000",
    "Pending": "#FFA500",
    "Complete": "#008000",
    };
  
    
    const statusColorTemplate = (props) => {
      const statusColorClasses = {
        "Processing": "bg-red-500 text-gray-100",
        "Pending": "bg-orange-500 text-gray-100",
        "Complete": "bg-green-500 text-gray-100",
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
        dataSource={orders}
        allowPaging={true}
        allowSorting={true}
        toolbar={toolbarOptions}
        pageSettings={{ pageSize: 20 }}
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
