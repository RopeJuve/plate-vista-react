import { useCart } from "../../contexts/CartContext";
import { useMenu } from "../../features/guest-ordering/MenuProvider";
import type { PlaceOrder, PlaceOrderPhase } from "../../features/guest-ordering/hooks/usePlaceOrder";
import { lineTotalCents, sumCents } from "../../shared/money/formatCents";
import { Chit } from "../rail";
import CartLineRow from "./CartLineRow";
import TotalLine from "./TotalLine";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BUTTON_LABEL: Record<PlaceOrderPhase, string> = {
  idle: "Order now",
  sending: "Placing…",
  error: "Retry order",
  success: "Order placed",
};

/** What the guest is about to order, and the button that sends it to the kitchen. */
const CartTab = ({ placeOrder }: { placeOrder: PlaceOrder }) => {
  const { cart, clearCart } = useCart();
  const { itemsById } = useMenu();
  const { phase, message, blocking, canSend, canPlace, fieldErrors, unavailableIds, place } = placeOrder;
  const estimated = sumCents(
    cart.map((line) => lineTotalCents(itemsById[line.productId]?.priceCents ?? 0, line.quantity))
  );

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2">
        {message && (
          <p
            className={cn(
              "mb-3 rounded-md px-3 py-2 text-center text-sm font-semibold",
              phase === "success" ? "bg-pass/10 text-pass-ink" : phase === "error" || blocking ? "bg-alert/10 text-alert-ink" : "bg-ink/[0.05] text-ink-soft"
            )}
            role="status"
          >
            {message}
          </p>
        )}
        {Object.keys(fieldErrors).length > 0 && (
          <ul className="mb-3 list-disc rounded-md bg-alert/10 py-2 pl-8 pr-3 text-sm text-alert-ink">
            {Object.entries(fieldErrors).map(([field, error]) => (
              <li key={field}>{error}</li>
            ))}
          </ul>
        )}
        {cart.length === 0 && !message && (
          <div className="py-10 text-center">
            <p className="text-lg font-bold">Cart is empty</p>
            <p className="mt-1 text-sm text-ink-soft">Add dishes from the menu, then send them to the kitchen from here.</p>
          </div>
        )}
        {cart.length > 0 && (
          <Chit lift="paper" innerClassName="bg-white px-4 pt-3">
            <ul>
              {cart.map((line, index) => (
                <CartLineRow
                  key={line.productId}
                  line={line}
                  menuItem={itemsById[line.productId]}
                  unavailable={unavailableIds.includes(line.productId)}
                  errors={[fieldErrors[`items.${index}.quantity`], fieldErrors[`items.${index}.notes`]].filter(Boolean)}
                />
              ))}
            </ul>
            <div className="perf mb-3 mt-1" />
            <TotalLine label="Total" cents={estimated} strong />
          </Chit>
        )}
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-2 border-t border-ink/10 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <Button type="button" size="xl" onClick={place} disabled={!canPlace} title={canSend ? "" : "Connecting…"}>
          {BUTTON_LABEL[phase]}
        </Button>
        <Button
          type="button"
          size="xl"
          variant="ghost"
          className="px-4 text-ink-soft"
          onClick={clearCart}
          disabled={cart.length === 0 || phase === "sending"}
        >
          Clear cart
        </Button>
      </div>
    </>
  );
};

export default CartTab;
