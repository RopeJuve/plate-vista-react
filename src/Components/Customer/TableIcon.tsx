import { useRealtime } from "../../shared/realtime/RealtimeProvider";
import { Lamp } from "../rail";

/** The guest's table, shown like the stub of a chit. */
const TableIcon = ({ tableNum }: { tableNum?: number }) => {
  const { status } = useRealtime();

  return (
    <div className="inline-flex h-10 items-center gap-2.5 rounded-md bg-ink pl-3 pr-3 text-paper">
      <Lamp status={status} showLabel={false} />
      <span className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-paper/70">Table</span>
      <span className="font-mono text-lg font-bold leading-none tabular">{tableNum || "–"}</span>
    </div>
  );
};

export default TableIcon;
