import { useState } from "react";
import type { CardReader } from "../../shared/api/payments";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type RemoveCardReaderDialogProps = {
  /** The reader to remove, or `null` while the dialog is closed. */
  reader: CardReader | null;
  onClose: () => void;
  /** Resolves `null` once the reader is gone, or the sentence saying why it stays. */
  onRemove: (id: string) => Promise<string | null>;
};

/** Asks before a card reader is removed here and at Stripe. */
const RemoveCardReaderDialog = ({ reader, onClose, onRemove }: RemoveCardReaderDialogProps) => {
  const [removing, setRemoving] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setProblem(null);
      onClose();
    }
  };

  const handleRemove = async () => {
    if (!reader) {
      return;
    }
    setRemoving(true);
    setProblem(null);
    const failure = await onRemove(reader.id);
    setRemoving(false);
    if (failure) {
      setProblem(failure);
      return;
    }
    onClose();
  };

  return (
    <Dialog open={reader !== null} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove {reader?.name}?</DialogTitle>
          <DialogDescription>
            Staff can no longer send bills to it. To use it again, register it with a new code from the reader.
          </DialogDescription>
        </DialogHeader>
        {problem && (
          <p role="alert" className="text-sm text-red-700">
            {problem}
          </p>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Keep reader
          </Button>
          <Button type="button" variant="destructive" onClick={handleRemove} disabled={removing}>
            {removing ? "Removing…" : "Remove reader"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RemoveCardReaderDialog;
