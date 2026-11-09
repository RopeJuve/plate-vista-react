import type { PaymentMethod } from "../../shared/api/payments";
import { formatCents } from "../../shared/money/formatCents";
import { methodLabel, type PayProblem } from "./billPayment";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ConfirmPaymentDialogProps = {
  method: PaymentMethod | null;
  totalCents: number;
  pending: boolean;
  problem: PayProblem | null;
  onCancel: () => void;
  onConfirm: () => void;
};

/** Asks staff to confirm the guest really paid this amount this way, before anything is recorded. */
const ConfirmPaymentDialog = ({ method, totalCents, pending, problem, onCancel, onConfirm }: ConfirmPaymentDialogProps) => (
  <Dialog open={Boolean(method)} onOpenChange={(open) => !open && !pending && onCancel()}>
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Record payment?</DialogTitle>
        <DialogDescription>Only confirm once the guest has paid.</DialogDescription>
      </DialogHeader>
      <dl className="divide-y divide-dashed divide-ink/15 font-mono text-sm">
        <div className="flex items-baseline justify-between gap-4 py-2">
          <dt className="uppercase tracking-[0.1em] text-ink-soft">Total</dt>
          <dd className="text-lg font-bold tabular">{formatCents(totalCents)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 py-2">
          <dt className="uppercase tracking-[0.1em] text-ink-soft">Method</dt>
          <dd className="font-bold">{method ? methodLabel(method) : ""}</dd>
        </div>
      </dl>
      {problem?.kind === "NETWORK" && (
        <p role="alert" className="text-sm font-semibold text-alert-ink">
          Could not reach the server. Confirm again to retry — the guest will not be charged twice.
        </p>
      )}
      {problem?.kind === "FAILED" && (
        <p role="alert" className="text-sm font-semibold text-alert-ink">
          Could not record the payment. Confirm again to retry.
        </p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={pending}>
          Cancel
        </Button>
        <Button type="button" size="lg" onClick={onConfirm} disabled={pending}>
          {pending ? "Recording…" : "Confirm payment"}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default ConfirmPaymentDialog;
