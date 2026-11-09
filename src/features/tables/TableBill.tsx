import PayBillPanel from "../payments/PayBillPanel";
import { useOpenSession } from "./hooks/useOpenSession";

/** The table's open bill in the admin dialog, where an owner or admin can record its payment. */
const TableBill = ({ tableId }: { tableId?: string }) => {
  const { sessionId, loading, failed } = useOpenSession(tableId);

  const body = () => {
    if (loading) {
      return <p className="text-sm text-ink-soft">Loading the bill…</p>;
    }
    if (failed) {
      return (
        <p role="alert" className="text-sm font-semibold text-alert-ink">
          Could not look up this table&apos;s bill.
        </p>
      );
    }
    if (!sessionId) {
      return <p className="text-sm text-ink-soft">No open bill at this table.</p>;
    }
    // Only owners and admins reach the admin pages, so they can activate the TSE themselves.
    return <PayBillPanel key={sessionId} sessionId={sessionId} canActivateTse />;
  };

  return (
    <section aria-label="Bill" className="space-y-3 border-t border-dashed border-ink/20 pt-4">
      <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">Bill</h3>
      {body()}
    </section>
  );
};

export default TableBill;
