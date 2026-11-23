import type { Receipt, ReceiptPaymentDetails } from "../../shared/api/payments";
import {
  cardBrandLabel,
  formatReceiptDateTime,
  fundingLabel,
  isCardPayment,
  paymentMethodLabel,
  paymentMethodTypeLabel,
  readMethodLabel,
  walletLabel,
} from "./receipt";
import { ReceiptField, ReceiptFields } from "./ReceiptFields";
import ReceiptSection from "./ReceiptSection";

/** "VISA •••• 4242 via Apple Pay", or "PayPal" for a payment that was not by card. */
const PaidWith = ({ details }: { details: ReceiptPaymentDetails }) => {
  if (!isCardPayment(details.type)) {
    return <p className="text-sm font-bold">{paymentMethodTypeLabel(details.type)}</p>;
  }
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span className="rounded-sm border border-ink px-1.5 py-px font-mono text-[0.65rem] font-bold tracking-[0.08em]">
        {cardBrandLabel(details.brand)}
      </span>
      {details.last4 && <span className="font-mono tabular">{`•••• ${details.last4}`}</span>}
      {details.wallet && <span className="text-ink-soft">{`via ${walletLabel(details.wallet)}`}</span>}
    </p>
  );
};

/** The card fields of a card payment, online or on a card reader; nothing for any other kind. */
const CardFields = ({ details }: { details: ReceiptPaymentDetails }) => {
  if (!isCardPayment(details.type)) {
    return null;
  }
  const funding = fundingLabel(details.funding);
  const readMethod = readMethodLabel(details.readMethod);
  return (
    <>
      {funding && <ReceiptField label="Kartentyp">{funding}</ReceiptField>}
      {details.applicationLabel && <ReceiptField label="Anwendung">{details.applicationLabel}</ReceiptField>}
      {details.aid && <ReceiptField label="AID">{details.aid}</ReceiptField>}
      {readMethod && <ReceiptField label="Lesemodus">{readMethod}</ReceiptField>}
    </>
  );
};

const PaymentDetails = ({ details }: { details: ReceiptPaymentDetails }) => (
  <div className="space-y-2">
    <PaidWith details={details} />
    <ReceiptFields label="Zahlungsdetails">
      <CardFields details={details} />
      {details.authorizedAt && <ReceiptField label="Zeit">{formatReceiptDateTime(details.authorizedAt)}</ReceiptField>}
      {details.transactionId && (
        <ReceiptField label="Transaktions-ID">
          <span className="break-all">{details.transactionId}</span>
        </ReceiptField>
      )}
      {isCardPayment(details.type) && details.authorizationCode && (
        <ReceiptField label="Autorisierungscode">{details.authorizationCode}</ReceiptField>
      )}
    </ReceiptFields>
  </div>
);

/** Only online and card reader payments carry what Stripe told us about them. */
const hasStripeDetails = (receipt: Receipt) => receipt.method === "ONLINE" || receipt.method === "CARD_READER";

/** How the bill was paid; for an online or card reader payment, what Stripe told us about it. */
const ReceiptPayment = ({ receipt }: { receipt: Receipt }) => (
  <ReceiptSection title="Zahlungsmittel">
    <div className="space-y-2">
      <div className="flex items-baseline gap-2 font-mono text-sm text-ink-soft">
        <span className="uppercase tracking-[0.1em]">Zahlungsart</span>
        <span className="leader" aria-hidden="true" />
        <span className="font-bold text-ink">{paymentMethodLabel(receipt.method)}</span>
      </div>
      {hasStripeDetails(receipt) && receipt.paymentDetails && <PaymentDetails details={receipt.paymentDetails} />}
    </div>
  </ReceiptSection>
);

export default ReceiptPayment;
