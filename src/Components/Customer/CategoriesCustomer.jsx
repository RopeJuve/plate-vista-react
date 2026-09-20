import React, { useEffect, useState } from "react";
import api from "../../services/api";
import CategoryCustomer from "./CategoryCustomer";
import SkeletonList from "./SkeletonList";
import { useStateContext } from "../../contexts/ContextProvider";
import { notify } from "../../utils/notify";

const CategoriesCustomer = ({ selectedCategory, setSelectedCategory }) => {
  const { categories, setCategories, search } = useStateContext();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getCategories = async () => {
      try {
        setIsLoading(true);
        const { data } = await api.get("/menu-items/category");
        setCategories(data);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        notify(error.response?.data?.message || "Could not load categories");
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
          <div className="px-6 mt-6 w-full pb-16 overflow-x-auto">
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
