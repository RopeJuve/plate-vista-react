---
name: structure-feature-code
description: Structures Plate Vista React code as small components, hooks in `hooks/`, pure domain modules, and tests in `tests/`, following the guest-ordering and staff-board patterns (CartModal, CartTab, usePlaceOrder, cartLines). Use when creating or extending a feature, adding a component, hook, or test file, when a component file passes ~150 lines or mixes UI with request/async logic, or when the user asks for smaller components, hook extraction, or a refactor.
---

# Structure Feature Code

Build features **split from the start**: small components, logic in hooks, rules in pure modules that can be tested without React.

## When to apply

Apply this skill when:
- Creating a new feature, screen section, dialog, or list
- Adding any hook or test file (their location is fixed, see below)
- A `.tsx` file is approaching **~150 lines** or mixes JSX with request/async logic
- The user mentions hooks, small components, structure, or "like CartTab / usePlaceOrder"

**Do not** split prematurely: a 40-line component with no shared logic stays one file.

## Where code goes

```
src/
  features/<feature>/           # kebab-case: guest-ordering, staff-board, order-amendment
    <domainModule>.ts           # pure rules, flat in the feature root: cartLines.ts, boardState.ts
    types.ts                    # types shared inside the feature
    <Name>Provider.tsx          # context + its consumer hook (useMenu, useStaffBoard)
    <Name>.tsx                  # components only this feature uses (MenuItemDialog, RangeSelect)
    hooks/
      use<Name>.ts              # every standalone hook
    tests/
      <domainModule>.test.ts    # one test file per pure module
  Components/
    Customer/ BarComponents/ AdminComponents/   # UI grouped by screen area
    rail/                       # shared design primitives, exported through rail/index.ts
    ui/                         # shadcn primitives
  shared/<domain>/              # used by 2+ features: api, auth, money, realtime
    hooks/  tests/              # same rule as features
  pages/                        # route-level components
  lib/schemas.ts                # every Zod schema + its inferred `Values` type
```

Hard rules:
- A standalone hook file is **always** in a `hooks/` subfolder, never flat beside other files.
- A `*.test.ts` file is **always** in a `tests/` subfolder next to the code it tests.
- Context-consumer hooks (`useCart`, `useMenu`, `useStaffBoard`) stay in their provider file. A new one must be added to `allowExportNames` in `eslint.config.js`.
- There is no `utils/` folder per feature. Pure logic gets a module named for what it is about (`cartLines.ts`, `placeOrderStatus.ts`), not `fooUtils.ts`.
- `src/contexts/`, `src/services/`, and `src/utils/` are older code. Use what is there; put new logic in `features/` or `shared/`.

## Responsibility split

| Layer | Owns | Must NOT own |
|-------|------|--------------|
| **Pure module** (`features/<f>/*.ts`) | Rules, reducers, transforms, status/message derivation | React, requests, storage side effects mixed with rules |
| **Hook** (`hooks/use*.ts`) | State, requests, effects, error reporting; calls the pure module | JSX, rules that could be a pure function |
| **Container component** (modal, tab, page section) | Calls hooks, owns state that must outlive its children, composes children | Request/try-catch blocks, long handlers |
| **Leaf component** (row, card, dialog) | Layout, local UI state (open/closed, draft text), events out | Requests, business rules |

Leaf components may read a context through its consumer hook (`CartLineRow` calls `useCart`). They do not call `request` or `api` themselves.

## Implementation workflow

Copy and track:

```
- [ ] 1. Sketch the data flow (pure module → hook → container → leaves)
- [ ] 2. Write the rules as pure functions in the feature root
- [ ] 3. Test them in tests/<module>.test.ts
- [ ] 4. Wrap state and requests in hooks/use<Name>.ts
- [ ] 5. Build the container, then split leaves (one concern per file)
- [ ] 6. npm run typecheck && npm run lint && npm test
```

### Step 1 — Find the boundaries

Split when one file has **any** of these:
- A `try { await request(...) } catch` block inside a component
- Pure helpers at the top of a component or hook file that decide something (limits, status, totals)
- Two unrelated `useState` groups (tab selection vs. an order being sent)
- A sub-component over ~20 lines defined in the same file
- The same handler written once per row or per station

### Step 2 — Pure module first

Same input, same output, no React. Setters take the current value and return the next one:

```typescript
/** A line never drops below one: taking it off the order is `removeLine`. */
export const setLineQuantity = (lines: CartLine[], productId: string, quantity: number): CartLine[] =>
  changeLine(lines, productId, (line) => ({ ...line, quantity: clampQuantity(quantity) }));
```

Vitest runs `src/**/*.test.ts` in `node` and `src/**/*.test.tsx` in `jsdom` with Testing Library (`src/test/setup.ts`). Rules still belong in a pure module with a `.test.ts`; when a hook grows decision logic, move it out the way `usePlaceOrder` delegates to `placeOrderStatus`. Use a `.test.tsx` for what only a rendered component shows.

Test helpers:
- REST: msw answers every payments-contract endpoint from `src/mocks/handlers/` + `src/mocks/fixtures/`. Change one answer for one test with `mockPayResponse(409, { code: "BILL_PAID" })` and friends from `src/mocks/overrides.ts`.
- Realtime: `createMockRealtime()` from `src/test/mockRealtime.ts`, render inside `src/test/RealtimeTestProviders.tsx`, then `realtime.emit("bill.paid", {...})`.
- `VITE_USE_MOCKS=true npm run dev` runs the app against the same msw handlers.

### Step 3 — Hook patterns

**State hook** over a pure module:

```typescript
export const useCartLines = (initial: CartLine[] | (() => CartLine[]) = []) => {
  const [lines, setLines] = useState<CartLine[]>(initial);
  const actions = useMemo(
    () => ({
      addLine: (productId: string) => setLines((current) => addLine(current, productId)),
      clearLines: () => setLines([]),
    }),
    []
  );
  return { lines, ...actions };
};
```

**Action hook** (one kind of request). It reports its own errors and resolves `false` when nothing changed, so components never need a try/catch:

```typescript
export const useGuestOrderActions = () => {
  const { request, status } = useRealtime();
  // settle(): await → rememberOrder → true, or notify(errorMessage(...)) → false
  return { canSend: status === "open", updateOrder, cancelOrder };
};
```

Rules:
- Named export, `use` prefix, return an **object**, never an array.
- Export the return type when a component receives the hook's result as a prop: `export type PlaceOrder = ReturnType<typeof usePlaceOrder>;`
- Differences between callers come in as arguments (`useOrderAmendment(saveAmendment)` serves both the guest bill and the staff check).
- Report errors with `notify(errorMessage(code, details, message))` for a `ProtocolError`, and a plain fallback string otherwise.

### Step 4 — Components

```tsx
/** What the guest is about to order, and the button that sends it to the kitchen. */
const CartTab = ({ placeOrder }: { placeOrder: PlaceOrder }) => {
  const { cart, clearCart } = useCart();
  // derive values, then return JSX
};

export default CartTab;
```

Rules:
- PascalCase file, arrow-function component, `export default` at the bottom.
- Props typed inline, or as `type <Name>Props` when there are more than ~5.
- One sentence of JSDoc above the component saying what it is in restaurant terms, not how it works.
- Handlers inside a component are named `handle*`; props that receive them are named `on*`.
- State lives in the lowest component that still outlives everything needing it. `CartModal` owns `usePlaceOrder` so a send in flight survives switching tabs.
- Tailwind only, `cn()` for conditional classes, `aria-label` on icon-only buttons.
- A private sub-component under ~20 lines may stay in the file (`Timer` in `TicketCard`). Anything larger gets its own file.
- Forms: React Hook Form + `zodResolver`, schema in `src/lib/schemas.ts`, fields built from `@/components/ui/form`.

One file per visual concern:

| File | Responsibility |
|------|----------------|
| `*Modal.tsx` / `*Dialog.tsx` | Shell: open/close, tabs, composes the rest |
| `*Tab.tsx` / `*List.tsx` | One panel: reads data, maps rows, footer actions |
| `*Row.tsx` / `*Card.tsx` | One item |
| `TotalLine.tsx`, `rail/*` | Small pieces reused across rows and cards |

### Step 5 — Imports

- `@/components/ui/*` and `@/lib/*` use the alias.
- Everything else (features, shared, contexts, sibling components) uses **relative** imports.
- Pure modules and tests use relative imports only.
- Import rail primitives from the barrel: `import { Chit, QtyStepper } from "../rail";`
- `import type` for type-only imports.

## Size guardrails

| File type | Soft max |
|-----------|----------|
| Container (modal, tab, page section) | ~120 lines |
| Leaf component | ~100 lines |
| Hook | ~100 lines; past that, move decisions into a pure module or split by concern |
| Pure module | No limit, but one subject per file |

## Anti-patterns

- ❌ `useFoo.ts` or `foo.test.ts` sitting flat in a feature folder
- ❌ `try/catch` around `request(...)` or `api.post(...)` inside a component
- ❌ Rules written inline in a hook where they cannot be tested
- ❌ A second copy of logic that already exists (`cartLines`, `formatCents`/`sumCents`, `errorMessage`, `ticketLines`, `apiMessage`, `fetchTableList`; see the table in reference.md)
- ❌ `fooUtils.ts` / `helpers.ts` / `constants.ts` grab-bags. A constant lives in the module about its subject (`OVERDUE_AFTER_MINUTES` in `ticketTiming.ts`, `BOARD_LANES` in `boardLanes.ts`, `ORDERS_PAGE_SIZE` in `orderRows.ts`)
- ❌ `error.response?.data?.message || "..."` written inline: use `apiMessage(error, fallback)`
- ❌ `onClick={() => { ...ten lines... }}` in JSX
- ❌ Reorganising files the task did not touch

## Reference implementations

Read the closest one before building something similar:

- `src/Components/Customer/CartModal.tsx` → `CartTab.tsx` → `CartLineRow.tsx`: shell, panel, row
- `src/features/guest-ordering/hooks/usePlaceOrder.ts` + `placeOrderStatus.ts`: a hook with its decisions pulled into a pure module
- `src/features/guest-ordering/cartLines.ts` + `hooks/useCartLines.ts` + `tests/cartLines.test.ts`: pure module, state hook, test
- `src/features/order-amendment/`: logic shared by two screens as its own feature
- `src/features/staff-board/`: `boardState.ts` reducer, `StaffBoardProvider.tsx`, `hooks/useOrderActions.ts`
- `src/Components/BarComponents/TicketCard.tsx` + `CancelTicketDialog.tsx`: card with an extracted dialog
- `src/Components/BarComponents/OrderDetails.tsx` → `CheckHeader`, `CheckOrder`, `UnsentLines`, `CheckFooter`, `CloseTableDialog`: a large container split into leaves
- `src/pages/Menu.tsx` + `src/features/menu/` (`menuItemForm.ts`, `hooks/useMenuItems.ts`, `AdminMenuItemCard.tsx`): an admin page as a thin container over a feature

More detail, a scaffold, and the refactor checklist: [reference.md](reference.md)

## Verification

Before finishing:

1. `npm run typecheck`
2. `npm run lint`
3. `npm test`
4. Existing import paths still resolve for every consumer of a moved file
5. No behavior change unless it was asked for
