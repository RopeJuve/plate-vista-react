import { useEffect, useState } from "react";
import { fetchData } from "../../services/fetchData";
import CategoryCustomer from "./CategoryCustomer";

const CategoriesCustomer = ({ selectedCategory, setSelectedCategory}) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const getCategories = async () => {
      const { data } = await fetchData(
        `${import.meta.env.VITE_VERCEL_API_URL}/menu-items/category`
      );

      setCategories(data);
    };
    getCategories();
  }, []);

  return (
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
  );
};

export default CategoriesCustomer;
