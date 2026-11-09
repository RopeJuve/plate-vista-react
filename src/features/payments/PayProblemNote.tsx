import { Link } from "react-router-dom";
import { formatCents } from "../../shared/money/formatCents";
import type { PayProblem } from "./billPayment";

/** Why the last payment was not recorded, in words staff can act on. Retryable problems show in the confirm step instead. */
const PayProblemNote = ({
  problem,
  currentTotalCents,
  canActivateTse,
}: {
  problem: PayProblem | null;
  currentTotalCents?: number;
  canActivateTse: boolean;
}) => {
  const message = () => {
    switch (problem?.kind) {
      case "BILL_CHANGED":
        return `The bill changed — new total ${formatCents(problem.totalCents ?? currentTotalCents ?? 0)}. Please confirm again.`;
      case "BILL_PAID":
        return "Already paid";
      case "BILL_EMPTY":
        return "Nothing to pay — close the table instead";
      case "TSE_NOT_ACTIVE":
        return canActivateTse ? (
          <Link to="/admin/kasse" className="underline underline-offset-2">
            Activate the TSE first
          </Link>
        ) : (
          "Ask the owner to activate the TSE"
        );
      default:
        return null;
    }
  };

  const content = message();
  if (!content) {
    return null;
  }
  return (
    <p role="alert" className="text-sm font-semibold text-alert-ink">
      {content}
    </p>
  );
};

export default PayProblemNote;
