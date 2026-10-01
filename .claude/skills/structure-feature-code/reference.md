# Structure Feature Code — Reference

## Real Plate Vista examples

### Guest cart (shell + panels + rows)

```
src/Components/Customer/
  CartModal.tsx        # shell: sheet, tab switch, owns usePlaceOrder
  CartTab.tsx          # panel: messages, lines, Order now / Clear cart
  CartLineRow.tsx      # one line: stepper, note, remove
  BillTab.tsx          # panel: orders on the bill, total to pay
  BillOrderCard.tsx    # one order, with amend/cancel
src/Components/rail/
  TotalLine.tsx        # label + leader + amount, on the guest's cart and bill and the staff check
src/features/guest-ordering/
  cartLines.ts         # add/set/remove/restore, within the order limits
  cartLimits.ts        # checkCart: what blocks an order
  pendingOrder.ts      # clientOrderId kept per unchanged set of lines
  placeOrderStatus.ts  # phase + errors → canPlace, message, unavailableIds
  hooks/
    useCartLines.ts          # state over cartLines.ts
    usePlaceOrder.ts         # send, retry once after reconnect
    useGuestOrderActions.ts  # update/cancel an order on the bill
  tests/
    cartLines.test.ts
    placeOrderStatus.test.ts
```

**Pattern:** the modal owns the hook whose state must survive a tab switch and passes its result down as one prop (`placeOrder: PlaceOrder`). Panels read shared data from context hooks. Everything that decides something is a pure function with a test.

### Order amendment (one behavior, two screens)

```
src/features/order-amendment/
  orderAmendment.ts            # beginDraft, stepQuantity, amendedItems
  hooks/useOrderAmendment.ts   # draft state; takes saveAmendment as an argument
  tests/orderAmendment.test.ts
```

**Pattern:** the guest bill and the staff check amend orders the same way and differ only in how the change is sent. The shared part is its own feature; each screen passes in its own `updateOrder`.

```tsx
const { canSend, updateOrder, cancelOrder } = useGuestOrderActions();
const amendment = useOrderAmendment(updateOrder);
```

### Staff board (reducer + provider + actions)

```
src/features/staff-board/
  boardState.ts              # boardReducer, emptyBoard: snapshot + live events
  StaffBoardProvider.tsx     # loads the snapshot, subscribes, exports useStaffBoard
  hooks/useOrderActions.ts   # changeStatus, cancelTicket, updateOrder, closeSession
  tests/boardState.test.ts
src/Components/BarComponents/
  TicketCard.tsx             # one ticket on the rail
  CancelTicketDialog.tsx     # asks for the reason; knows nothing about requests
```

**Pattern:** the provider holds state and wiring only; every state transition is in the reducer, which is where the tests are. The dialog takes `onConfirm: (reason) => Promise<void>` and the card supplies it from the hook.

## Scaffold template

A new feature `table-transfer` with a dialog on the staff screen:

```
src/features/table-transfer/
  tableTransfer.ts             # pure: which tables can receive, what moves
  hooks/useTableTransfer.ts    # request + error reporting
  tests/tableTransfer.test.ts
src/Components/BarComponents/
  TransferTableDialog.tsx      # shell: open/close, composes the list
  TransferTableRow.tsx         # one candidate table
```

### tableTransfer.ts (starter)

```typescript
import type { Table } from "../../shared/realtime/protocol";

/** Tables a check can move to: open ones, other than where it already is. */
export const transferTargets = (tables: Table[], fromTableId: string): Table[] =>
  tables.filter((table) => table._id !== fromTableId && !table.sessionId);
```

### hooks/useTableTransfer.ts (starter)

```typescript
import { useRealtime } from "../../../shared/realtime/RealtimeProvider";
import { errorMessage } from "../../../shared/realtime/errorMessages";
import { ProtocolError } from "../../../shared/realtime/protocol";
import { notify } from "../../../utils/notify";

/** Moving a check to another table. Reports its own errors and resolves false when nothing moved. */
export const useTableTransfer = () => {
  const { request, status } = useRealtime();

  const transfer = async (sessionId: string, toTableId: string) => {
    try {
      await request("session.transfer", { sessionId, toTableId });
      return true;
    } catch (error) {
      notify(error instanceof ProtocolError ? errorMessage(error.code, error.details, error.message) : "Could not move the table");
      return false;
    }
  };

  return { canSend: status === "open", transfer };
};
```

### TransferTableDialog.tsx (starter)

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useStaffBoard } from "../../features/staff-board/StaffBoardProvider";
import { transferTargets } from "../../features/table-transfer/tableTransfer";
import { useTableTransfer } from "../../features/table-transfer/hooks/useTableTransfer";
import TransferTableRow from "./TransferTableRow";

/** Picks the table a check moves to. */
const TransferTableDialog = ({
  sessionId,
  fromTableId,
  open,
  onOpenChange,
}: {
  sessionId: string;
  fromTableId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { state } = useStaffBoard();
  const { canSend, transfer } = useTableTransfer();

  const handlePick = async (toTableId: string) => {
    if (await transfer(sessionId, toTableId)) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move to table</DialogTitle>
        </DialogHeader>
        <ul>
          {transferTargets(state.tables, fromTableId).map((table) => (
            <TransferTableRow key={table._id} table={table} disabled={!canSend} onPick={handlePick} />
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
};

export default TransferTableDialog;
```

The names in this scaffold (`session.transfer`, `state.tables`) are illustrative. Check `src/shared/realtime/protocol.ts` and `boardState.ts` for what actually exists.

## Decision tree: where does this code go?

```
Is it JSX?
  yes → component
        used by one screen area      → src/Components/<Area>/
        a design primitive (chit, stepper, lamp) → src/Components/rail/ + rail/index.ts
        belongs to one feature's form/data       → src/features/<feature>/
  no  → Is it pure (no React, no requests)?
        yes → module in src/features/<feature>/   (+ tests/<module>.test.ts)
              needed by 2+ features               → src/shared/<domain>/ or its own feature
        no  → Does it provide context to a subtree?
              yes → <Name>Provider.tsx, consumer hook exported beside it
              no  → hooks/use<Name>.ts
```

## Check before writing a helper

| Need | Already exists |
|------|----------------|
| Format or add money | `formatCents`, `sumCents`, `lineTotalCents` in `src/shared/money/formatCents.ts` |
| Order limits | `LIMITS` in `src/shared/realtime/protocol.ts` |
| Message for a protocol error | `errorMessage` in `src/shared/realtime/errorMessages.ts` |
| Message for anything a realtime `request` threw | `requestErrorMessage(error, fallback)` in `src/shared/realtime/errorMessages.ts` |
| Message for a failed REST call | `apiMessage(error, fallback)` in `src/utils/notify.ts` |
| Toast | `notify` in `src/utils/notify.ts` |
| A station's lines of an order, ticket labels | `ticketLines`, `TICKET_LABEL`, `isUntouched` in `src/shared/realtime/tickets.ts` |
| Cart line changes, item count, cart total | `src/features/guest-ordering/cartLines.ts` (`countItems`, `linesTotalCents`) |
| What a guest still pays | `payableOrders`, `payableCents` in `src/features/guest-ordering/billState.ts` |
| Send-order button text | `PLACE_ORDER_LABEL` in `src/features/guest-ordering/placeOrderStatus.ts` |
| Tables from `GET /table`, sorting, QR tables | `fetchTableList` in `src/features/tables/tablesApi.ts`, `src/features/tables/tableList.ts` |
| Ticket and table overdue limits | `src/features/staff-board/ticketTiming.ts` |
| Rail lanes, open order count | `src/features/staff-board/boardLanes.ts` |
| Staff display name, avatar letter, sign-out | `staffName`, `initialOf` in `src/shared/auth/staffName.ts`; `useSignOut` in `src/shared/auth/hooks/` |
| Label + leader + amount line | `TotalLine` from `src/Components/rail` |
| Elapsed time that ticks | `useNow`, `formatElapsed`, `minutesSince` from `src/Components/rail` |
| Conditional classes | `cn` in `src/lib/utils.ts` |
| Form schema | `src/lib/schemas.ts` |

## Test conventions

- One `describe` per module, named in plain words: `describe("cart lines", ...)`.
- `it` names state the rule, not the function: `"stops at the limits for one order"`.
- Fixtures are small consts at the top of the file (`soup`, `cola`).
- Assert unchanged input with `toBe` (same reference), changed output with `toEqual`.

## Refactor trigger checklist

Split an existing file when **2 or more** apply:

- [ ] File over ~150 lines
- [ ] 2+ unrelated `useState` groups
- [ ] Inline sub-component over ~20 lines
- [ ] `try/catch` around a request inside a component
- [ ] 3+ pure helpers at the top of a component or hook file
- [ ] The same handler pattern repeated per row, order, or station

When splitting:
1. Move pure helpers to a feature module first and add their test.
2. Move state and requests to `hooks/use<Name>.ts`.
3. Split the JSX last.
4. Keep the component's file path and default export, so its importers do not change.
5. Work on a `refactor/<name>` branch (`feat/<name>` for new features).
