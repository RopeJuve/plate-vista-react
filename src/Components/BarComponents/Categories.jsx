import { useEffect, useState } from "react";
import { fetchData } from "../../services/fetchData";
import CategoryItem from "./CategoryItem";

const Categories = ({ setCategory }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await fetchData(
          `${import.meta.env.VITE_VERCEL_API_URL}/menu-items/category`
        );
        setCategories(data);
      } catch (error) {
        console.log("Error fetching categories", error);
      }
    };
    fetchCategories();
  }, []);
  return (
    <div className="grid space-y-1">
      {categories?.map((category, index) => (
        <CategoryItem
          key={`${category}-${index}`}
          categoryName={category}
          setCategory={setCategory}
        />
      ))}
    </div>
  );
};

export default Categories;
