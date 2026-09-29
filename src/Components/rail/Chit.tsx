import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ChitProps = HTMLAttributes<HTMLDivElement> & {
  /** Hang the chit from a rail clip (staff board). */
  clipped?: boolean;
  /** Play the print-in motion when the chit first mounts. */
  printed?: boolean;
  /** Shadow depth: hanging on steel, or lying on paper. */
  lift?: "steel" | "paper" | "none";
  innerClassName?: string;
  children?: ReactNode;
};

/**
 * One printed order slip. The torn bottom edge is a mask, so the drop shadow
 * lives on the wrapper (a filter on the masked element would be masked too).
 */
const Chit = forwardRef<HTMLDivElement, ChitProps>(
  ({ clipped = false, printed = false, lift = "steel", className, innerClassName, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative",
        lift === "steel" && "chit-shadow",
        lift === "paper" && "chit-shadow-soft",
        printed && "print-in",
        clipped && "pt-2",
        className
      )}
      {...props}
    >
      {clipped && (
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-0 z-10 h-4 w-12 -translate-x-1/2 rounded-b-md rounded-t-sm bg-steel-500 shadow-[0_2px_3px_rgb(0_0_0/0.45)]"
        />
      )}
      <div className={cn("chit rounded-t-[3px]", innerClassName)}>{children}</div>
    </div>
  )
);
Chit.displayName = "Chit";

export default Chit;
