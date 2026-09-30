import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ScrollRowProps = {
  children: ReactNode;
  label: string;
  /** Classes for the scrolling row itself (padding, gap, width). */
  className?: string;
  /** Tailwind "from-*" colour the edges fade into; match the background. */
  fadeFrom?: string;
  /** Changes when the selection changes, so the selected tab scrolls into view. */
  activeKey?: string;
};

// A horizontal tab row that can be scrolled with touch, the mouse wheel, or the
// arrow buttons that appear while more tabs are hidden on that side.
const ScrollRow = ({ children, label, className, fadeFrom = "from-paper", activeKey }: ScrollRowProps) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const row = rowRef.current;
    if (!row) return;
    setEdges({
      left: row.scrollLeft > 1,
      right: row.scrollLeft + row.clientWidth < row.scrollWidth - 1,
    });
  }, []);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;
    measure();
    row.addEventListener("scroll", measure, { passive: true });
    const resize = new ResizeObserver(measure);
    resize.observe(row);
    Array.from(row.children).forEach((child) => resize.observe(child));
    // A vertical wheel scrolls the row sideways while it can move that way.
    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      const canMove =
        event.deltaY < 0 ? row.scrollLeft > 0 : row.scrollLeft + row.clientWidth < row.scrollWidth;
      if (!canMove) return;
      event.preventDefault();
      row.scrollLeft += event.deltaY;
    };
    row.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      row.removeEventListener("scroll", measure);
      row.removeEventListener("wheel", onWheel);
      resize.disconnect();
    };
  }, [measure, children]);

  useEffect(() => {
    const selected = rowRef.current?.querySelector<HTMLElement>('[aria-selected="true"]');
    selected?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
  }, [activeKey]);

  const scrollBy = (direction: -1 | 1) => {
    const row = rowRef.current;
    if (row) row.scrollBy({ left: direction * row.clientWidth * 0.7, behavior: "smooth" });
  };

  const arrow = (side: "left" | "right") => {
    const Icon = side === "left" ? ChevronLeft : ChevronRight;
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 z-10 flex w-16 items-center",
          side === "left" ? "left-0 justify-start bg-gradient-to-r" : "right-0 justify-end bg-gradient-to-l",
          fadeFrom,
          "to-transparent"
        )}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-label={side === "left" ? "Scroll categories left" : "Scroll categories right"}
          onClick={() => scrollBy(side === "left" ? -1 : 1)}
          className="pointer-events-auto mx-1 grid h-8 w-8 place-items-center rounded-full bg-white text-ink shadow-sm ring-1 ring-ink/10 hover:bg-ink hover:text-paper"
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    );
  };

  return (
    <div className="relative min-w-0">
      {edges.left && arrow("left")}
      <div ref={rowRef} role="tablist" aria-label={label} className={cn("no-scrollbar flex overflow-x-auto", className)}>
        {children}
      </div>
      {edges.right && arrow("right")}
    </div>
  );
};

export default ScrollRow;
