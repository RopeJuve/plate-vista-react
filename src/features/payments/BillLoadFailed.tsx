import { Button } from "@/components/ui/button";

/** The bill could not be read: say so, with a way to read it again. */
const BillLoadFailed = ({ onReload }: { onReload: () => void }) => (
  <div className="flex flex-wrap items-center gap-3">
    <p role="alert" className="text-sm font-semibold text-alert-ink">
      Could not load the bill.
    </p>
    <Button type="button" variant="outline" size="sm" onClick={onReload}>
      Reload
    </Button>
  </div>
);

export default BillLoadFailed;
