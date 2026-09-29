import { useEffect, useState } from "react";
import api from "../../services/api";
import CategoryItem from "./CategoryItem";
import { notify, apiMessage } from "../../utils/notify";
import { toCategoryList } from "../../features/guest-ordering/menu";

const Categories = ({
  category,
  setCategory,
}: {
  category: string;
  setCategory: (category: string) => void;
}) => {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await api.get("/menu-items/category");
        setCategories(toCategoryList(data));
      } catch (error: unknown) {
        notify(apiMessage(error, "Could not load categories"));
      }
    };
    fetchCategories();
  }, []);

  // Land on the first category once they load, instead of an empty grid.
  useEffect(() => {
    if (categories.length && !categories.includes(category)) {
      setCategory(categories[0]);
    }
  }, [categories, category, setCategory]);

  return (
    <div
      role="tablist"
      aria-label="Menu categories"
      className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto px-3 pb-3 pt-3 sm:px-5 lg:px-0 lg:pt-0"
    >
      {categories.map((name, index) => (
        <CategoryItem
          key={`${name}-${index}`}
          categoryName={name}
          active={name === category}
          setCategory={setCategory}
        />
      ))}
      {categories.length === 0 &&
        Array.from({ length: 5 }, (_, index) => (
          <span key={index} className="h-11 w-24 shrink-0 animate-pulse rounded-full bg-steel-800" aria-hidden="true" />
        ))}
    </div>
  );
};

export default Categories;
