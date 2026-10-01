import { useEffect, useMemo, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import type { Order } from "../../../types";
import { apiMessage, notify } from "../../../utils/notify";
import { tableNumbersById } from "../../tables/tableList";
import { fetchTableList } from "../../tables/tablesApi";
import { ORDERS_PAGE_SIZE, toOrderRows } from "../orderRows";
import { fetchOrdersPage } from "../ordersApi";

/** One page of every order the restaurant has taken, as table rows, paged on the server. */
export const useOrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [numbersById, setNumbersById] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: ORDERS_PAGE_SIZE });

  useEffect(() => {
    fetchOrdersPage({ page: pagination.pageIndex + 1, limit: ORDERS_PAGE_SIZE })
      .then((page) => {
        setOrders(page.orders);
        setTotal(page.total);
      })
      .catch((error) => {
        if (import.meta.env.DEV) {
          console.error("Error fetching orders:", error);
        }
        notify(apiMessage(error, "Could not load orders"));
      });
  }, [pagination.pageIndex]);

  useEffect(() => {
    fetchTableList()
      .then((tables) => setNumbersById(tableNumbersById(tables)))
      .catch(() => {
        // Without the table list the Location column stays blank; orders still render.
      });
  }, []);

  const rows = useMemo(() => toOrderRows(orders, numbersById), [orders, numbersById]);

  return {
    rows,
    total,
    pageCount: Math.ceil(total / ORDERS_PAGE_SIZE) || 1,
    pagination,
    setPagination,
  };
};
