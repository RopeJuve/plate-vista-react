import { useState } from "react";
import { ArrowDown, ArrowUp, Check, Pencil, Trash2, X } from "lucide-react";
import type { VatRate } from "../../shared/api/payments";
import type { Category, Station } from "./categoriesApi";
import StationSelect from "./StationSelect";
import VatBadge from "./VatBadge";
import VatRateSelect from "./VatRateSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** One menu section in the admin's list: reorder, rename, change station and VAT rate, delete. */
const CategoryRow = ({
  category,
  first,
  last,
  onMove,
  onRename,
  onStationChange,
  onVatRateChange,
  onDelete,
}: {
  category: Category;
  first: boolean;
  last: boolean;
  onMove: (direction: "up" | "down") => void;
  /** Resolves true once the new name is saved. */
  onRename: (name: string) => Promise<boolean>;
  onStationChange: (station: Station) => void;
  /** Resolves to an error message, or null once the new rate is saved. */
  onVatRateChange: (vatRate: VatRate) => Promise<string | null>;
  onDelete: () => void;
}) => {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(category.name);
  const [vatError, setVatError] = useState<string | null>(null);

  const handleVatRateChange = async (vatRate: VatRate) => {
    setVatError(await onVatRateChange(vatRate));
  };

  const handleSaveName = async () => {
    if (await onRename(name)) {
      setRenaming(false);
    }
  };

  const handleCancelRename = () => {
    setName(category.name);
    setRenaming(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete the category "${category.name}"?`)) {
      onDelete();
    }
  };

  return (
    <li className="flex flex-wrap items-center gap-2 border-b border-dashed border-ink/10 py-3">
      <div className="flex gap-1">
        <Button type="button" variant="ghost" size="icon" disabled={first} aria-label={`Move ${category.name} up`} onClick={() => onMove("up")}>
          <ArrowUp aria-hidden="true" />
        </Button>
        <Button type="button" variant="ghost" size="icon" disabled={last} aria-label={`Move ${category.name} down`} onClick={() => onMove("down")}>
          <ArrowDown aria-hidden="true" />
        </Button>
      </div>
      {renaming ? (
        <div className="flex min-w-0 flex-1 gap-1">
          <Input
            aria-label={`New name for ${category.name}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void handleSaveName();
              if (event.key === "Escape") setRenaming(false);
            }}
            autoFocus
            className="h-9"
          />
          <Button type="button" variant="ghost" size="icon" aria-label="Save name" onClick={() => void handleSaveName()}>
            <Check aria-hidden="true" />
          </Button>
          <Button type="button" variant="ghost" size="icon" aria-label="Cancel rename" onClick={handleCancelRename}>
            <X aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="truncate font-semibold">{category.name}</span>
          <VatBadge rate={category.vatRate} />
        </span>
      )}
      <StationSelect label={`Station for ${category.name}`} value={category.station} onChange={onStationChange} />
      <VatRateSelect
        label={`VAT rate for ${category.name}`}
        value={category.vatRate}
        onChange={(vatRate) => void handleVatRateChange(vatRate)}
      />
      {!renaming && (
        <Button type="button" variant="ghost" size="icon" aria-label={`Rename ${category.name}`} onClick={() => setRenaming(true)}>
          <Pencil aria-hidden="true" />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-ink-soft hover:bg-alert/10 hover:text-alert-ink"
        aria-label={`Delete ${category.name}`}
        onClick={handleDelete}
      >
        <Trash2 aria-hidden="true" />
      </Button>
      {vatError && (
        <p role="alert" className="w-full text-right text-sm font-medium text-destructive">
          {vatError}
        </p>
      )}
    </li>
  );
};

export default CategoryRow;
