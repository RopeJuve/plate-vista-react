import CategoryCustomer from "./CategoryCustomer";
import ScrollRow from "../ScrollRow";
import { useStateContext } from "../../contexts/ContextProvider";

const CategoriesCustomer = ({
  selectedCategory,
  setSelectedCategory,
  categories,
}: {
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: string[];
}) => {
  const { search } = useStateContext();

  if (search) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <ScrollRow
        label="Menu categories"
        activeKey={selectedCategory}
        className="snap-x scroll-px-4 gap-2 px-4 py-3 sm:scroll-px-6 sm:px-6"
      >
        {categories.map((category, i) => (
          <CategoryCustomer
            key={`${i}${category}`}
            category={category}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        ))}
      </ScrollRow>
    </div>
  );
};

export default CategoriesCustomer;
