import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dayLabel, MAX_RANGES_PER_DAY } from "./openingHours";
import type { OpeningRange, Weekday } from "./types";

type DayHoursRowProps = {
  day: Weekday;
  ranges: OpeningRange[];
  error?: string;
  onChange: (ranges: OpeningRange[]) => void;
};

const NEW_RANGE: OpeningRange = { open: "11:00", close: "22:00" };

/** One weekday's opening times: none means closed, up to three ranges, a close before the open runs past midnight. */
const DayHoursRow = ({ day, ranges, error, onChange }: DayHoursRowProps) => {
  const label = dayLabel(day);
  const handleTime = (index: number, key: keyof OpeningRange, value: string) =>
    onChange(ranges.map((range, i) => (i === index ? { ...range, [key]: value } : range)));

  return (
    <div className="grid gap-2 py-3 sm:grid-cols-[7rem_1fr] sm:items-start" role="group" aria-label={label}>
      <p className="pt-2.5 text-sm font-semibold text-ink">{label}</p>
      <div className="space-y-2">
        {ranges.length === 0 && <p className="pt-2.5 text-sm text-ink-soft">Closed</p>}
        {ranges.map((range, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              type="time"
              className="w-32 font-mono tabular"
              value={range.open}
              aria-label={`${label} opens`}
              onChange={(event) => handleTime(index, "open", event.target.value)}
            />
            <span className="text-ink-soft" aria-hidden="true">
              –
            </span>
            <Input
              type="time"
              className="w-32 font-mono tabular"
              value={range.close}
              aria-label={`${label} closes`}
              onChange={(event) => handleTime(index, "close", event.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Remove ${label} ${range.open}–${range.close}`}
              onClick={() => onChange(ranges.filter((_, i) => i !== index))}
            >
              <X aria-hidden="true" />
            </Button>
          </div>
        ))}
        {ranges.length < MAX_RANGES_PER_DAY && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2"
            aria-label={`Add opening time on ${label}`}
            onClick={() => onChange([...ranges, NEW_RANGE])}
          >
            <Plus aria-hidden="true" />
            Add time
          </Button>
        )}
        {error && (
          <p className="text-sm font-medium text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
};

export default DayHoursRow;
