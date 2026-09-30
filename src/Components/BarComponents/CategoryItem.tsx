import { cn } from "@/lib/utils";

const CategoryItem = ({
  categoryName,
  active,
  setCategory,
}: {
  categoryName: string;
  active: boolean;
  setCategory: (category: string) => void;
}) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    className={cn(
      "h-11 shrink-0 rounded-full px-5 text-sm font-bold capitalize transition-colors",
      active ? "bg-paper text-ink" : "bg-steel-800 text-steel-300 hover:bg-steel-700 hover:text-paper"
    )}
    onClick={() => setCategory(categoryName)}
  >
    {categoryName}
  </button>
);

export default CategoryItem;
