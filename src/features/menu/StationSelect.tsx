import type { Station } from "./categoriesApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** Where a category's orders are prepared: the kitchen or the bar. */
const StationSelect = ({ value, onChange, label }: { value: Station; onChange: (value: Station) => void; label: string }) => (
  <Select value={value} onValueChange={(next) => onChange(next as Station)}>
    <SelectTrigger aria-label={label} className="h-9 w-28">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="kitchen">Kitchen</SelectItem>
      <SelectItem value="bar">Bar</SelectItem>
    </SelectContent>
  </Select>
);

export default StationSelect;
