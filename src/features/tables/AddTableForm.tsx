import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { notify } from "../../utils/notify";
import { parseNewTable } from "./tableList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** The admin's form for putting a new table on the floor. */
const AddTableForm = ({
  saving,
  onAdd,
}: {
  saving: boolean;
  onAdd: (table: { tableNumber: number; capacity: number }) => Promise<boolean>;
}) => {
  const [tableNumber, setTableNumber] = useState("1");
  const [capacity, setCapacity] = useState("4");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const table = parseNewTable(tableNumber, capacity);
    if (!table) {
      notify("Enter a table number and capacity");
      return;
    }
    void onAdd(table);
  };

  return (
    <form
      className="mb-8 flex flex-wrap items-end gap-3 rounded-xl bg-white p-4 ring-1 ring-ink/[0.07]"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-1.5">
        <Label htmlFor="table-number">Table number</Label>
        <Input
          id="table-number"
          type="number"
          min={1}
          value={tableNumber}
          onChange={(event) => setTableNumber(event.target.value)}
          className="w-32 font-mono"
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="table-capacity">Capacity</Label>
        <Input
          id="table-capacity"
          type="number"
          min={1}
          value={capacity}
          onChange={(event) => setCapacity(event.target.value)}
          className="w-32 font-mono"
        />
      </div>
      <Button type="submit" size="lg" className="h-11" disabled={saving}>
        <Plus aria-hidden="true" />
        {saving ? "Adding…" : "Add table"}
      </Button>
    </form>
  );
};

export default AddTableForm;
