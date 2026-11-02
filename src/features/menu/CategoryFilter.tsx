import ScrollRow from "../../Components/ScrollRow";
import type { Category } from "./categoriesApi";
import { cn } from "@/lib/utils";

const ALL = { _id: "", name: "All" };

/** The row of category pills above the admin's menu. An empty id means every category. */
const CategoryFilter = ({
  categories,
  selectedId,
  onSelect,
}: {
  categories: Pick<Category, "_id" | "name">[];
  selectedId: string;
  onSelect: (categoryId: string) => void;
}) => (
  <ScrollRow label="Filter by category" activeKey={selectedId} className="gap-2 px-1 pb-1">
    {[ALL, ...categories].map((category) => {
      const active = selectedId === category._id;
      return (
        <button
          key={category._id || "all"}
          type="button"
          role="tab"
          aria-selected={active}
          onClick={() => onSelect(category._id)}
          className={cn(
            "h-10 shrink-0 rounded-full px-4 text-sm font-bold transition-colors",
            active ? "bg-ink text-paper" : "bg-white text-ink/70 ring-1 ring-inset ring-ink/10 hover:text-ink hover:ring-ink/25"
          )}
        >
          {category.name}
        </button>
      );
    })}
  </ScrollRow>
);

export default CategoryFilter;
