import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** Asks an owner or admin to confirm cancelling the guest's online payment. Sends nothing itself. */
const UnfreezeBillDialog = ({
  open,
  pending,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <Dialog open={open} onOpenChange={(next) => !next && !pending && onCancel()}>
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>Unfreeze the bill?</DialogTitle>
        <DialogDescription>
          The guest&apos;s online payment will be cancelled and the table can order again.
        </DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={pending}>
          Keep waiting
        </Button>
        <Button type="button" size="lg" onClick={onConfirm} disabled={pending}>
          {pending ? "Unfreezing…" : "Unfreeze bill"}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default UnfreezeBillDialog;
