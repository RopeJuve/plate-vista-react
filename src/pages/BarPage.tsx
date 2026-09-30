import { useState } from "react";
import { useParams } from "react-router-dom";
import { OrderProvider } from "../contexts/OrderContext";
import BarHeader from "../Components/BarComponents/BarHeader";
import OrderDetails from "../Components/BarComponents/OrderDetails";
import Categories from "../Components/BarComponents/Categories";
import BarMenuItems from "../Components/BarComponents/BarMenuItems";

const BarPage = () => {
  const { tableId = "" } = useParams();
  const [category, setCategory] = useState("");
  return (
    // The order pad belongs to the open table: `key` discards it on every table
    // change so lines never follow the waiter to the next table.
    <OrderProvider key={tableId}>
      <div className="steel steel-ground flex h-dvh flex-col overflow-hidden text-paper">
        <BarHeader />
        <div className="mx-auto grid min-h-0 w-full max-w-[1920px] flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,26rem)] lg:gap-5 lg:p-5">
          <section aria-label="Menu" className="flex min-h-0 flex-col">
            <Categories category={category} setCategory={setCategory} />
            <BarMenuItems category={category} />
          </section>
          <OrderDetails />
        </div>
      </div>
    </OrderProvider>
  );
};

export default BarPage;
