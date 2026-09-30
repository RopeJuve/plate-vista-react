import { useEffect, useMemo, useState } from "react";
import type { ColumnDef, PaginationState } from "@tanstack/react-table";
import { Header } from "../Components/AdminComponents";
import { fetchOrders, readOrdersPayload } from "../services/orderDataFetch";
import { fetchTables } from "../services/tableDataFetch";
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
import { formatCents, readCents } from "../shared/money/formatCents";
import { ORDER_STATUS_LABEL, type OrderStatus } from "../shared/realtime/protocol";

const PAGE_SIZE = 20;

/**
 * Keyed by protocol `OrderStatus` — the lowercase values the API actually sends.
 * Same meaning as on the board: signal = new, ink = on the line, green = done.
 */
const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  pending: "bg-signal text-ink",
  accepted: "bg-ink text-paper",
  preparing: "bg-ink text-paper",
  ready: "bg-pass text-ink",
  served: "bg-pass/15 text-pass-ink",
  cancelled: "bg-ink/10 text-ink-soft line-through",
};

/**
 * A protocol order carries only `tableId`, so the table number has to be
 * resolved against `GET /table`. Legacy payloads that already embed the number
 * still win.
 */
const transformOrders = (
  orders: Order[] = [],
  tableNumbersById: Record<string, number> = {}
): OrderRow[] =>
  orders.map((order) => {
    const protocolItems = (order as { items?: Array<{ title?: string; quantity?: number }> }).items;
    const menuItemsDetails = protocolItems
      ? protocolItems.map((item) => ({
          title: item.title || "Unavailable item",
          quantity: item.quantity || 0,
        }))
      : (order.menuItems || [])
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
      totalPrice: readCents((order as { totalCents?: number }).totalCents, order.totalPrice),
      orderStatus: (order as { status?: string }).status || order.orderStatus,
      location:
        order.tableNumber ??
        order.table?.tableNumber ??
        tableNumbersById[String((order as { tableId?: string }).tableId ?? "")] ??
        "",
      orderId: order._id,
    };
  });

const Orders = () => {
  const [rawOrders, setRawOrders] = useState<Order[]>([]);
  const [tableNumbersById, setTableNumbersById] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const orders = useMemo(
    () => transformOrders(rawOrders, tableNumbersById),
    [rawOrders, tableNumbersById]
  );

  const loadOrders = (page: number) => {
    fetchOrders({ page, limit: PAGE_SIZE })
      .then((response) => {
        const { orders: pageOrders, total: pageTotal } = readOrdersPayload(response.data);
        setRawOrders(pageOrders as Order[]);
        setTotal(pageTotal);
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

  useEffect(() => {
    fetchTables()
      .then((response) => {
        const raw = Array.isArray(response.data) ? response.data : response.data?.tables || [];
        const byId: Record<string, number> = {};
        (raw as Array<{ _id?: string; tableNumber?: number }>).forEach((table) => {
          if (table?._id && Number.isFinite(Number(table.tableNumber))) {
            byId[String(table._id)] = Number(table.tableNumber);
          }
        });
        setTableNumbersById(byId);
      })
      .catch(() => {
        // Without the table list the Location column stays blank; orders still render.
      });
  }, []);

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
        cell: ({ row }) => <span className="font-mono font-semibold">{formatCents(row.original.totalPrice)}</span>,
      },
      {
        accessorKey: "orderStatus",
        header: "Order Status",
        cell: ({ row }) => {
          const status = row.original.orderStatus as OrderStatus | undefined;
          const statusClasses = status ? STATUS_BADGE_CLASSES[status] ?? "" : "";
          return (
            <span
              className={`inline-flex h-6 items-center rounded px-2 text-[0.7rem] font-bold uppercase tracking-[0.08em] ${statusClasses}`}
            >
              {(status && ORDER_STATUS_LABEL[status]) || row.original.orderStatus}
            </span>
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
        cell: ({ row }) => (
          <span className="font-mono text-xs text-ink-soft" title={row.original.orderId}>
            {row.original.orderId ? `#${row.original.orderId.slice(-6).toUpperCase()}` : ""}
          </span>
        ),
      },
    ],
    []
  );

  return (
    <div>
      <Header title="Orders" description={total ? `${total} orders in total.` : "Every order from every table."} />
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
