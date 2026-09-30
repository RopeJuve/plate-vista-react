import { STATS_RANGES, type StatsRange } from "./statsRange";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type RangeSelectProps = {
  value: StatsRange;
  onChange: (range: StatsRange) => void;
};

const RangeSelect = ({ value, onChange }: RangeSelectProps) => (
  <div className="w-40">
    <Select value={value} onValueChange={(next) => onChange(next as StatsRange)}>
      <SelectTrigger aria-label="Time range" className="h-9 text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATS_RANGES.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default RangeSelect;
