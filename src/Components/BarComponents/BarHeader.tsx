import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import { Lamp, Wordmark } from "../rail";
import StaffChip from "./StaffChip";

const BarHeader = () => {
  const { status } = useRealtime();
  return (
    <header className="shrink-0 border-b border-white/[0.06] bg-steel-950/95">
      <div className="mx-auto flex h-14 max-w-[1920px] items-center gap-3 px-3 sm:px-5">
        <Link
          to="/bar"
          className="inline-flex h-10 items-center gap-2 rounded-md pl-2 pr-3 text-sm font-bold text-paper transition-colors hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Floor
        </Link>
        <span className="hidden h-6 w-px bg-white/10 sm:block" aria-hidden="true" />
        <Wordmark compact className="hidden text-paper sm:inline-flex" />
        <Lamp status={status} className="text-steel-300" />
        <div className="ml-auto">
          <StaffChip />
        </div>
      </div>
    </header>
  );
};

export default BarHeader;
