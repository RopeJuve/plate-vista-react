const CategoryCustomer = ({
  category,
  setSelectedCategory,
  selectedCategory,
}) => {
  const categoryClass =
    selectedCategory === category
      ? "bg-black text-white font-semibold px-4 py-1 border border-black rounded-xl flex-shrink-0"
      : "px-4 py-1 font-semibold border border-black rounded-xl flex-shrink-0";
  return <div id={`${category}`} className={categoryClass} onClick={(e) => setSelectedCategory(e.target.id)}>{category}</div>;
};

export default CategoryCustomer;
