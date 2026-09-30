import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Asks staff why a ticket is being cancelled; the guest reads the reason on their bill. */
const CancelTicketDialog = ({
  id,
  title,
  tableNumber,
  open,
  onOpenChange,
  onConfirm,
}: {
  /** Tells apart the reason fields of the tickets on the rail. */
  id: string;
  title: string;
  tableNumber: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => Promise<void>;
}) => {
  const [reason, setReason] = useState("");

  const handleConfirm = async () => {
    await onConfirm(reason.trim() || "Cancelled by staff");
    onOpenChange(false);
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>Table {tableNumber} will see this reason on their bill.</DialogDescription>
        </DialogHeader>
        <label htmlFor={`reason-${id}`} className="text-sm font-semibold">
          Reason
        </label>
        <Textarea
          id={`reason-${id}`}
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          className="min-h-24"
          placeholder="Out of stock, guest changed their mind…"
          aria-label="Cancellation reason"
        />
        <Button type="button" variant="destructive" size="lg" onClick={handleConfirm}>
          Confirm cancel
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default CancelTicketDialog;
