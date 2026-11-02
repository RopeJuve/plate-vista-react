import { TotalLine } from "../rail";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** Asks staff to confirm closing a table, showing what the check comes to. Knows nothing about requests. */
const CloseTableDialog = ({
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
  onConfirm: () => void;
}) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Close table {tableNumber}?</DialogTitle>
        <DialogDescription>Guests at this table will see a thank-you screen.</DialogDescription>
      </DialogHeader>
      <TotalLine label="Total" cents={totalCents} strong />
      <Button type="button" variant="destructive" size="lg" onClick={onConfirm}>
        Close table
      </Button>
    </DialogContent>
  </Dialog>
);

export default CloseTableDialog;
