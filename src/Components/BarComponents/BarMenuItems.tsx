import { useOrder } from "../../contexts/OrderContext";
import { useMenu } from "../../features/guest-ordering/MenuProvider";
import { formatCents } from "../../shared/money/formatCents";

const BarMenuItems = ({ category }: { category: string }) => {
  const { items } = useMenu();
  const visible = items.filter((item) => item.category === category && !item.archived);

  return (
    <div className="col-span-3 rounded-lg bg-main-dark-bg">
      <h2 className="bg-main-dark-bg pb-1 text-center text-2xl font-semibold uppercase">{category}</h2>
      <div className="bar-menu-item-container text-center">
        {visible.map((menuItem) => (
          <BarMenuItemButton key={menuItem._id} productId={menuItem._id} title={menuItem.title} priceCents={menuItem.priceCents} inStock={menuItem.inStock} />
        ))}
      </div>
    </div>
  );
};

const BarMenuItemButton = ({
  productId,
  title,
  priceCents,
  inStock,
}: {
  productId: string;
  title: string;
  priceCents: number;
  inStock: boolean;
}) => {
  const { addOrder } = useOrder();
  return (
    <button
      type="button"
      className="rounded-lg bg-secondary-dark-bg px-3 py-2 disabled:opacity-40"
      onClick={() => addOrder(productId)}
      disabled={!inStock}
    >
      {title} · {formatCents(priceCents)}
    </button>
  );
};

export default BarMenuItems;
