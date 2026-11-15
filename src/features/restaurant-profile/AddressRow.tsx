import { Check, Copy, MapPin } from "lucide-react";
import { useCopyText } from "./hooks/useCopyText";
import { addressLine } from "./mapLinks";
import type { ProfileAddress } from "./types";

/** Where the restaurant is, with a button that copies the address for a taxi or a friend. */
const AddressRow = ({ address }: { address: ProfileAddress }) => {
  const { copied, copy } = useCopyText();

  return (
    <div className="flex items-start gap-3 px-4 py-3.5">
      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-ink-soft" aria-hidden="true" />
      <address className="min-w-0 flex-1 not-italic">
        <p className="font-semibold text-ink">{address.street}</p>
        <p className="text-sm text-ink-soft">{`${address.zip} ${address.city}`}</p>
      </address>
      <button
        type="button"
        onClick={() => copy(addressLine(address))}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-md text-ink hover:bg-paper-deep"
        aria-label={copied ? "Address copied" : "Copy address"}
      >
        {copied ? <Check className="h-4 w-4 text-pass-ink" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
      </button>
      <span className="sr-only" role="status">
        {copied ? "Address copied" : ""}
      </span>
    </div>
  );
};

export default AddressRow;
