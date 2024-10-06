import React, { useEffect, useState } from "react";
import { fetchData } from "../../services/fetchData";
import CategoryCustomer from "./CategoryCustomer";
import SkeletonList from "./SkeletonList";
import { useStateContext } from "../../contexts/ContextProvider";

const CategoriesCustomer = ({ selectedCategory, setSelectedCategory }) => {
  const { categories, setCategories, search } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getCategories = async () => {
      try {
        setIsLoading(true);
        const { data } = await fetchData(
          `${import.meta.env.VITE_VERCEL_API_URL}/menu-items/category`
        );
        setCategories(data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error(error);
      }
    };
    getCategories();
  }, [setCategories]);

  return (
    <>
      {!search && (
        isLoading ? (
          <SkeletonList itemsCount={8} isLoading={isLoading} variant="category" />
        ) : (
          <div className="px-6 mt-6 w-full overflow-x-auto">
            <div className="grid grid-flow-row auto-rows-max grid-cols-card gap-3 p-2 rounded-md shadow-md">
              {categories.map((category, i) => (
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
