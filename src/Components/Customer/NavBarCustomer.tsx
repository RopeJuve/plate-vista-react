import { Search, X } from "lucide-react";
import { useStateContext } from "../../contexts/ContextProvider";
import TableIcon from "./TableIcon";
import { Wordmark } from "../rail";

const NavBarCustomer = ({
  tableNum,
  joinCode,
  onShowCode,
}: {
  tableNum?: number;
  /** Shown as a small chip; tapping it brings the big code back. */
  joinCode?: string;
  onShowCode?: () => void;
}) => {
  const { search, setSearch } = useStateContext();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-3 sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <Wordmark className="text-ink" />
        <div className="flex items-center gap-2">
          {joinCode && (
            <button
              type="button"
              onClick={onShowCode}
              className="h-10 rounded-md border border-ink/15 px-3 font-mono text-sm font-bold tracking-[0.15em] text-ink hover:bg-ink/[0.05]"
              aria-label={`Show table code ${joinCode.split("").join(" ")}`}
            >
              {joinCode}
            </button>
          )}
          <TableIcon tableNum={tableNum} />
        </div>
      </div>
      <div className="relative mt-3">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-ink/45" aria-hidden="true" />
        <input
          className="h-12 w-full rounded-full border border-ink/10 bg-white pl-11 pr-11 text-base text-ink shadow-[0_1px_2px_rgb(0_0_0/0.04)] outline-none transition-[border-color,box-shadow] placeholder:text-ink/45 focus:border-signal focus:ring-[3px] focus:ring-signal/20"
          type="search"
          name="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search dishes or ingredients"
          aria-label="Search for meals or ingredients"
          autoComplete="off"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-ink/60 hover:bg-ink/[0.06]"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default NavBarCustomer;
