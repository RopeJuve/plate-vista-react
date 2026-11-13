import { useParams } from "react-router-dom";
import { Chit, Wordmark } from "../../Components/rail";
import { useReceipt } from "./hooks/useReceipt";
import { signatureNotice } from "./receipt";
import ReceiptActions from "./ReceiptActions";
import ReceiptView from "./ReceiptView";

const Message = ({ title, text }: { title: string; text?: string }) => (
  <div className="text-center">
    <h1 className="text-2xl font-black tracking-[-0.03em]">{title}</h1>
    {text && <p className="mt-2 text-sm text-ink-soft">{text}</p>}
  </div>
);

/**
 * The guest's receipt behind the link they were given after paying. Public, in German.
 * Printed (or saved as PDF), only the receipt remains: `receipt-print` in index.css sets the 80 mm page.
 */
const ReceiptPage = () => {
  const { receiptToken = "" } = useParams();
  const state = useReceipt(receiptToken);

  return (
    <main
      lang="de"
      className="receipt-print flex min-h-dvh flex-col items-center bg-paper px-4 py-8 text-ink sm:py-12 print:block print:min-h-0 print:bg-white print:p-0 print:text-black"
    >
      <Wordmark className="mb-6 text-ink print:hidden" />
      <Chit
        lift="paper"
        className="w-full max-w-sm print:max-w-none print:filter-none"
        innerClassName="bg-white px-5 pb-10 pt-6 sm:px-6 print:p-0 print:[mask:none] print:[-webkit-mask:none]"
      >
        {state.phase === "loading" && <p className="text-center text-sm text-ink-soft">Beleg wird geladen…</p>}
        {state.phase === "missing" && (
          <Message title="Beleg nicht gefunden" text="Bitte prüfen Sie den Link oder fragen Sie das Personal." />
        )}
        {state.phase === "failed" && (
          <Message title="Beleg konnte nicht geladen werden." text="Wir versuchen es gleich noch einmal." />
        )}
        {state.phase === "ready" && (
          <ReceiptView
            receipt={state.receipt}
            notice={signatureNotice(state.receipt.signature.status, state.waitedMs)}
          />
        )}
      </Chit>
      {state.phase === "ready" && <ReceiptActions className="mt-6 w-full max-w-sm" />}
    </main>
  );
};

export default ReceiptPage;
