import SkeletonCard from "./SkeletonCard";
import SkeletonCategoryCustomer from "./SkeletonCategoryCustomer";

const SkeletonList = ({
  itemsCount,
  isLoading,
  variant = "card",
}: {
  itemsCount: number;
  isLoading: boolean;
  variant?: "card" | "category";
}) => {
  if (!isLoading) {
    return null;
  }
  const items = Array.from({ length: itemsCount }, (_, index) => index);

  return variant === "category" ? (
    <div className="no-scrollbar mx-auto flex w-full max-w-3xl gap-2 overflow-hidden px-4 py-3 sm:px-6">
      {items.map((index) => (
        <SkeletonCategoryCustomer key={index} />
      ))}
    </div>
  ) : (
    <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
      {items.map((index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

export default SkeletonList;
