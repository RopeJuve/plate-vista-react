import { useEffect, useState } from "react";
import api from "../../services/api";
import CategoryCustomer from "./CategoryCustomer";
import SkeletonList from "./SkeletonList";
import { useStateContext } from "../../contexts/ContextProvider";
import { notify, apiMessage } from "../../utils/notify";

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
        setCategories(data);
        setIsLoading(false);
      } catch (error: unknown) {
        setIsLoading(false);
        notify(apiMessage(error, "Could not load categories"));
      }
    };
    getCategories();
  }, [providedCategories, setCategories]);

  return (
    <>
      {!search && (
        isLoading ? (
          <SkeletonList itemsCount={8} isLoading={isLoading} variant="category" />
        ) : (
          <div className="px-6 mt-6 w-full pb-16 overflow-x-auto">
            <div className="grid grid-flow-row auto-rows-max grid-cols-card gap-3 p-2 rounded-md shadow-md">
              {visibleCategories.map((category, i) => (
                <CategoryCustomer
                  key={`${i}${category}`}
                  category={category}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
              ))}
            </div>
          </div>
        )
      )}
    </>
  );
};

export default CategoriesCustomer;
