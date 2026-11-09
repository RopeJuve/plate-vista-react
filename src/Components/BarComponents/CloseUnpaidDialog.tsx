import { useState, type FormEvent } from "react";
import { TotalLine } from "../rail";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

/** Lets an owner or admin close a table whose bill was never paid, saying why. Sends nothing until confirmed. */
const CloseUnpaidDialog = ({
  tableNumber,
  totalCents,
  open,
  onOpenChange,
  onConfirm,
}: {
  tableNumber?: number;
  totalCents: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<unknown>;
}) => {
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const trimmed = reason.trim();

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReason("");
    }
    onOpenChange(next);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!trimmed || sending) {
      return;
    }
    setSending(true);
    try {
      await onConfirm(trimmed);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close table {tableNumber} without payment?</DialogTitle>
          <DialogDescription>The bill stays unpaid. Say why, for the end-of-day report.</DialogDescription>
        </DialogHeader>
        <TotalLine label="Unpaid" cents={totalCents} strong />
        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="unpaid-reason" className="text-sm font-semibold">
            Reason
          </label>
          <Textarea
            id="unpaid-reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="min-h-24"
            placeholder="Guests left without paying"
            required
          />
          <Button type="submit" variant="destructive" size="lg" className="w-full" disabled={!trimmed || sending}>
            Close without payment
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CloseUnpaidDialog;
