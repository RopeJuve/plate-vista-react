import type { CardReaderValues } from "@/lib/schemas";
import AddCardReaderForm from "./AddCardReaderForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type AddCardReaderDialogProps = {
  /** Which reader is being added, or `null` while the dialog is closed. */
  adding: "REGISTERED" | "SIMULATED" | null;
  onClose: () => void;
  onAdd: (values: CardReaderValues) => Promise<string | null>;
};

/** Which readers work here, and what stays a Card Terminal recorded by hand. */
const ReaderHelp = () => (
  <div className="space-y-2 rounded-lg bg-ink/[0.04] p-3 text-xs text-ink-soft">
    <p>
      Works with the Stripe Reader S700, S710 and BBPOS WisePOS E. On the reader, open Settings → Generate pairing
      code and type the code it shows.
    </p>
    <p>
      A reader still registered to another Stripe account has to be removed there first; then it shows a new code
      for this restaurant.
    </p>
    <p>
      Bluetooth readers, and card machines from your bank or another provider, stay a Card Terminal: staff record
      those payments by hand.
    </p>
  </div>
);

/** Registering a new card reader, or a simulated one in test mode. */
const AddCardReaderDialog = ({ adding, onClose, onAdd }: AddCardReaderDialogProps) => {
  const simulated = adding === "SIMULATED";

  return (
    <Dialog open={adding !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{simulated ? "Add simulated reader" : "Add card reader"}</DialogTitle>
          <DialogDescription>
            {simulated
              ? "Stripe simulates this reader so you can try card payments without a device. It only exists in test mode."
              : "Name it so staff know which reader to send a bill to."}
          </DialogDescription>
        </DialogHeader>
        {!simulated && <ReaderHelp />}
        <AddCardReaderForm simulated={simulated} onAdd={onAdd} onAdded={onClose} />
      </DialogContent>
    </Dialog>
  );
};

export default AddCardReaderDialog;
