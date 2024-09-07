import { useEffect, useState } from "react";
import { fetchData } from "../../services/fetchData";
import CategoryCustomer from "./CategoryCustomer";
import SkeletonList from "./SkeletonList";

const CategoriesCustomer = ({ selectedCategory, setSelectedCategory }) => {
  const [categories, setCategories] = useState([]);
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
  }, []);

  return (
    <>
      {isLoading ? (
        <SkeletonList itemsCount={8} isLoading={isLoading} variant="category" />
      ) : (
        <div className="px-6 mt-4 flex items-center gap-3 overflow-x-scroll no-scrollbar scroll-smooth">
          {categories.map((category, i) => (
            <CategoryCustomer
              key={`${i}${category}`}
              category={category}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default CategoriesCustomer;
