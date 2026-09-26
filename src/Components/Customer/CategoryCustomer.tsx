import { useStateContext } from "../../contexts/ContextProvider";

const CategoryCustomer = ({
  category,
  setSelectedCategory,
  selectedCategory,
}: {
  category: string;
  setSelectedCategory: (category: string) => void;
  selectedCategory: string;
}) => {
  const { currentColor } = useStateContext();
  const categoryClass =
    selectedCategory === category
      ? `flex-grow px-4 py-2 rounded-md mx-2 text-sm font-semibold text-center text-white bg-orange-400 shadow-md`
      : `flex-grow px-4 py-2 rounded-md mx-2 text-sm font-semibold text-center text-gray-700 bg-white hover:bg-gray-300 shadow-md`;

  return (
    <button
      id={`${category}`}
      className={`${categoryClass}`}
      onClick={(event) => setSelectedCategory(event.currentTarget.id)}
      style={{
        backgroundColor:
          selectedCategory === category ? currentColor : "",
      }}
    >
      {category}
    </button>
  );
};

export default CategoryCustomer;
