import { Header } from "../Components/AdminComponents";
import { ORDER_COLUMNS } from "../features/orders/orderColumns";
import { ORDERS_PAGE_SIZE } from "../features/orders/orderRows";
import { useOrderHistory } from "../features/orders/hooks/useOrderHistory";
import { DataTable } from "@/components/ui/data-table";

/** Every order from every table, newest page first. */
const Orders = () => {
  const { rows, total, pageCount, pagination, setPagination } = useOrderHistory();

  return (
    <div>
      <Header title="Orders" description={total ? `${total} orders in total.` : "Every order from every table."} />
      <DataTable
        columns={ORDER_COLUMNS}
        data={rows}
        searchPlaceholder="Search orders"
        pageSize={ORDERS_PAGE_SIZE}
        manualPagination
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  );
};

export default Orders;
