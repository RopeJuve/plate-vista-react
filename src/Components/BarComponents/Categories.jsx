import { useEffect, useState } from "react";
import api from "../../services/api";
import CategoryItem from "./CategoryItem";
import { notify } from "../../utils/notify";

const Categories = ({ setCategory }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/menu-items/category");
        setCategories(data);
      } catch (error) {
        notify(error.response?.data?.message || "Could not load categories");
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
