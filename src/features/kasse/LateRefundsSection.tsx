import { useLateRefunds } from "./hooks/useLateRefunds";
import LateRefundRow from "./LateRefundRow";
import { Button } from "@/components/ui/button";

/**
 * Late Payments: online payments that completed after their bill was settled. The API
 * refunded them in full and never booked them, so this is a quiet record with no actions.
 */
const LateRefundsSection = () => {
  const { rows, loading, loadFailed, reload, hasMore, showMore, loadingMore, moreFailed } = useLateRefunds();

  const body = () => {
    if (loading && rows.length === 0) {
      return <p className="text-sm text-ink-soft">Loading…</p>;
    }
    if (loadFailed && rows.length === 0) {
      return (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-alert-ink">
            Could not load the refunded online payments.
          </p>
          <Button type="button" variant="outline" onClick={reload} className="w-full sm:w-auto">
            Reload list
          </Button>
        </div>
      );
    }
    if (rows.length === 0) {
      return <p className="text-sm text-ink-soft">No refunded online payments.</p>;
    }
    return (
      <div className="space-y-4">
        <ul aria-label="Refunded online payments" className="divide-y divide-paper-line">
          {rows.map((refund) => (
            <LateRefundRow key={refund.id} refund={refund} />
          ))}
        </ul>
        {moreFailed && (
          <p role="alert" className="text-sm text-alert-ink">
            Could not load more refunds. Please try again.
          </p>
        )}
        {hasMore && (
          <Button
            type="button"
            variant="outline"
            onClick={showMore}
            disabled={loadingMore}
            aria-busy={loadingMore}
            className="w-full sm:w-auto"
          >
            {loadingMore ? "Loading…" : "Show more"}
          </Button>
        )}
      </div>
    );
  };

  return (
    <section
      aria-labelledby="late-refunds-title"
      className="max-w-2xl rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6"
    >
      <h2 id="late-refunds-title" className="text-lg font-bold text-ink">
        Refunded online payments
      </h2>
      <p className="mb-4 mt-1 text-sm text-ink-soft">
        Online payments that came in after the bill was already settled. They were refunded in full automatically.
      </p>
      {body()}
    </section>
  );
};

export default LateRefundsSection;
