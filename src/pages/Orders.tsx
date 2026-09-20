import { useEffect, useMemo, useState } from "react";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Header } from "../Components/AdminComponents";
import { fetchOrders } from "../services/orderDataFetch";
import { ORDER_STATUS } from "../constants/orderStatus";
import { notify } from "../utils/notify";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Order, OrderRow } from "@/types";

const PAGE_SIZE = 20;

const transformOrders = (orders: Order[] = []): OrderRow[] =>
  orders.map((order) => {
    const menuItemsDetails = (order.menuItems || [])
      .filter((item) => typeof item === "object" && item.product)
      .map((item) => ({
        title: typeof item === "object" ? item.product?.title ?? "Unavailable item" : "Unavailable item",
        quantity: typeof item === "object" ? item.quantity || 0 : 0,
      }));

    const totalQuantity = menuItemsDetails.reduce(
      (acc, item) => acc + (item.quantity || 0),
      0
    );

    const username =
      typeof order.user === "string"
        ? order.user
        : order.user?.username || "Guest User";

    return {
      user: username,
      menuItems: menuItemsDetails,
      quantity: totalQuantity,
      totalPrice: order.totalPrice || 0,
      orderStatus: order.orderStatus,
      location: order.tableNumber ?? order.table?.tableNumber ?? "",
      orderId: order._id,
    };
  });

const Orders = () => {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const loadOrders = (page: number) => {
    fetchOrders({ page, limit: PAGE_SIZE })
      .then((response) => {
        const pageOrders = response.data?.orders ?? [];
        setOrders(transformOrders(pageOrders));
        setTotal(response.data?.total ?? pageOrders.length);
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error("Error fetching orders:", error);
        }
        notify(error.response?.data?.message || "Could not load orders");
      });
  };

  useEffect(() => {
    loadOrders(pagination.pageIndex + 1);
  }, [pagination.pageIndex]);

  const columns = useMemo<ColumnDef<OrderRow>[]>(
    () => [
      {
        accessorKey: "user",
        header: "User",
      },
      {
        accessorKey: "menuItems",
        header: "Menu Items",
        cell: ({ row }) => {
          const menuItems = row.original.menuItems || [];
          if (menuItems.length === 0) {
            return <span>Unavailable item</span>;
          }
          if (menuItems.length > 1) {
            return (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="outline" size="sm">
                    See products
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {menuItems.map((item, index) => (
                    <DropdownMenuItem key={`${item.title}-${index}`}>
                      {item.title} ({item.quantity})
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            );
          }
          return <span>{menuItems[0]?.title ?? "Unavailable item"}</span>;
        },
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
      },
      {
        accessorKey: "totalPrice",
        header: "Total Price",
      },
      {
        accessorKey: "orderStatus",
        header: "Order Status",
        cell: ({ row }) => {
          const statusColorClasses = {
            [ORDER_STATUS.PROCESSING]: "bg-red-500 text-gray-100",
            [ORDER_STATUS.PENDING]: "bg-orange-500 text-gray-100",
            [ORDER_STATUS.COMPLETE]: "bg-green-500 text-gray-100",
          };
          const statusClasses = statusColorClasses[row.original.orderStatus] || "";
          return (
            <div className={`inline-block rounded-full px-2 py-2 text-center ${statusClasses}`}>
              {row.original.orderStatus}
            </div>
          );
        },
      },
      {
        accessorKey: "location",
        header: "Location",
      },
      {
        accessorKey: "orderId",
        header: "Order ID",
      },
    ],
    []
  );

  return (
    <div className="m-4 md:m-10 mt-24 p-10 bg-white dark:bg-d-main-bg rounded-3xl shadow-lg transition-colors duration-300 ease-in-out">
      <Header title="Orders" />
      <DataTable
        columns={columns}
        data={orders}
        searchPlaceholder="Search orders"
        pageSize={PAGE_SIZE}
        manualPagination
        pageCount={Math.ceil(total / PAGE_SIZE) || 1}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  );
};

export default Orders;
