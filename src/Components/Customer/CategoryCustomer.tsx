import { cn } from "@/lib/utils";

const CategoryCustomer = ({
  category,
  setSelectedCategory,
  selectedCategory,
}: {
  category: string;
  setSelectedCategory: (category: string) => void;
  selectedCategory: string;
}) => {
  const active = selectedCategory === category;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(
        "h-10 shrink-0 snap-start rounded-full px-4 text-sm font-bold capitalize transition-colors",
        active ? "bg-ink text-paper" : "bg-white text-ink/75 ring-1 ring-inset ring-ink/10 hover:text-ink hover:ring-ink/25"
      )}
      onClick={() => setSelectedCategory(category)}
    >
      {category}
    </button>
  );
};

export default CategoryCustomer;
