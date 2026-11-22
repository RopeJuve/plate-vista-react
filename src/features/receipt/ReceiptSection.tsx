import { ChevronDown } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A titled part of the receipt the guest can fold away on screen.
 * Printed (or saved as PDF), it is always open.
 */
const ReceiptSection = ({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();

  return (
    <section aria-label={title} className="space-y-2">
      <h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-center justify-between gap-2 text-left text-sm font-bold"
        >
          {title}
          <ChevronDown
            aria-hidden="true"
            className={cn("h-4 w-4 text-ink-soft transition-transform print:hidden", open && "rotate-180")}
          />
        </button>
      </h2>
      <div id={bodyId} className={cn(!open && "hidden print:block")}>
        {children}
      </div>
    </section>
  );
};

export default ReceiptSection;
