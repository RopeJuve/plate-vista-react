const CategoryItem = ({
  categoryName,
  setCategory,
}: {
  categoryName: string;
  setCategory: (category: string) => void;
}) => {
  const colors: Record<string, string> = {
    beer: "bg-orange-600",
    wine: "bg-red-500",
    burgers: "bg-green-500",
    pizza: "bg-yellow-500",
    salads: "bg-pink-500",
    desserts: "bg-purple-500",
  };
  return (
    <button
      className={`text-center flex items-center justify-center rounded-lg ${colors[categoryName] ? colors[categoryName] : "bg-blue-500"} `}
      onClick={() => setCategory(categoryName)}
    >
      {categoryName}
    </button>
  );
};

export default CategoryItem;
