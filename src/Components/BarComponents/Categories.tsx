import { useEffect, useState } from "react";
import api from "../../services/api";
import CategoryItem from "./CategoryItem";
import { notify, apiMessage } from "../../utils/notify";

const Categories = ({ setCategory }: { setCategory: (category: string) => void }) => {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/menu-items/category");
        setCategories(data);
      } catch (error: unknown) {
        notify(apiMessage(error, "Could not load categories"));
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
