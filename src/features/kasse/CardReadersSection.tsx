import { useState } from "react";
import type { CardReader } from "../../shared/api/payments";
import AddCardReaderDialog from "./AddCardReaderDialog";
import CardReaderRow from "./CardReaderRow";
import RemoveCardReaderDialog from "./RemoveCardReaderDialog";
import { useCardReaders } from "./hooks/useCardReaders";
import { Button } from "@/components/ui/button";
import type { CardReaderValues } from "@/lib/schemas";

const NOT_READY_ID = "card-readers-not-ready";

/** Why no reader can be added yet; only the owner can open the Payout Account. */
const PayoutNotReady = ({ canOpenPayoutAccount }: { canOpenPayoutAccount: boolean }) => (
  <p id={NOT_READY_ID} className="text-sm text-ink-soft">
    Card readers can be added once the Payout Account can take payments.{" "}
    {canOpenPayoutAccount ? (
      <>
        Finish setting up the{" "}
        <a href="#online-payments" className="font-semibold text-ink underline underline-offset-2">
          Payout Account
        </a>
        .
      </>
    ) : (
      "Ask the owner to finish setting up the Payout Account."
    )}
  </p>
);

/** The restaurant's card readers: staff send a bill to one and the guest pays by card there. */
const CardReadersSection = ({ canOpenPayoutAccount }: { canOpenPayoutAccount: boolean }) => {
  const readers = useCardReaders();
  const [adding, setAdding] = useState<"REGISTERED" | "SIMULATED" | null>(null);
  const [removing, setRemoving] = useState<CardReader | null>(null);

  const handleAdd = ({ registrationCode, name }: CardReaderValues) =>
    adding === "SIMULATED"
      ? readers.addSimulated(name.trim())
      : readers.add({ registrationCode: registrationCode.trim(), name: name.trim() });

  const body = () => {
    if (readers.unavailable) {
      return <p className="text-sm text-ink-soft">{"Card readers aren't available on this server yet."}</p>;
    }
    if (readers.loading && !readers.loaded) {
      return <p className="text-sm text-ink-soft">Loading…</p>;
    }
    if (readers.loadFailed) {
      return (
        <div className="space-y-3">
          <p role="alert" className="text-sm text-red-700">
            Could not load the card readers.
          </p>
          <Button type="button" variant="outline" onClick={readers.reload} className="w-full sm:w-auto">
            Reload
          </Button>
        </div>
      );
    }
    const blocked = !readers.payoutAccountReady;
    return (
      <div className="space-y-4">
        {readers.readers.length === 0 ? (
          <p className="text-sm text-ink-soft">No card readers yet.</p>
        ) : (
          <ul aria-label="Card readers" className="divide-y divide-ink/[0.07]">
            {readers.readers.map((reader) => (
              <CardReaderRow key={reader.id} reader={reader} onRemove={setRemoving} />
            ))}
          </ul>
        )}
        {blocked && <PayoutNotReady canOpenPayoutAccount={canOpenPayoutAccount} />}
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={() => setAdding("REGISTERED")}
            disabled={blocked}
            aria-describedby={blocked ? NOT_READY_ID : undefined}
          >
            Add reader
          </Button>
          {readers.testMode && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setAdding("SIMULATED")}
              disabled={blocked}
              aria-describedby={blocked ? NOT_READY_ID : undefined}
            >
              Add simulated reader
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <section
      aria-labelledby="card-readers-title"
      className="scroll-mt-4 max-w-2xl rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6"
    >
      <h2 id="card-readers-title" className="mb-4 text-lg font-bold text-ink">
        Card readers
      </h2>
      {body()}
      <AddCardReaderDialog adding={adding} onClose={() => setAdding(null)} onAdd={handleAdd} />
      <RemoveCardReaderDialog reader={removing} onClose={() => setRemoving(null)} onRemove={readers.remove} />
    </section>
  );
};

export default CardReadersSection;
