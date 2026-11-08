import type { VatRate } from "../../shared/api/payments";
import { VAT_RATE_OPTIONS } from "./categoryVat";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/** The VAT rate every item in a category is sold at: food 7 %, drinks 19 %. */
const VatRateSelect = ({ value, onChange, label }: { value: VatRate; onChange: (value: VatRate) => void; label: string }) => (
  <Select value={value} onValueChange={(next) => onChange(next as VatRate)}>
    <SelectTrigger aria-label={label} className="h-9 w-36">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {VAT_RATE_OPTIONS.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default VatRateSelect;
