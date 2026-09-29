import { useEffect, useState } from "react";
import api from "../../services/api";
import CategoryCustomer from "./CategoryCustomer";
import SkeletonList from "./SkeletonList";
import { useStateContext } from "../../contexts/ContextProvider";
import { notify, apiMessage } from "../../utils/notify";
import { toCategoryList } from "../../features/guest-ordering/menu";

const CategoriesCustomer = ({
  selectedCategory,
  setSelectedCategory,
  categories: providedCategories,
}: {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories?: string[];
}) => {
  const { categories, setCategories, search } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);
  const visibleCategories = providedCategories ?? categories;

  useEffect(() => {
    if (providedCategories) {
      return;
    }
    const getCategories = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get("/menu-items/category");
        setCategories(toCategoryList(data));
        setIsLoading(false);
      } catch (error: unknown) {
        setIsLoading(false);
        notify(apiMessage(error, "Could not load categories"));
      }
    };
    getCategories();
  }, [providedCategories, setCategories]);

  if (search) {
    return null;
  }

  if (isLoading) {
    return <SkeletonList itemsCount={6} isLoading={isLoading} variant="category" />;
  }

  return (
    <div
      role="tablist"
      aria-label="Menu categories"
      className="no-scrollbar mx-auto flex w-full max-w-3xl snap-x scroll-px-4 gap-2 sm:scroll-px-6 overflow-x-auto px-4 py-3 sm:px-6"
    >
      {visibleCategories.map((category, i) => (
        <CategoryCustomer
          key={`${i}${category}`}
          category={category}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      ))}
    </div>
  );
};

export default CategoriesCustomer;
