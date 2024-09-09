const CategoryCustomer = ({
  category,
  setSelectedCategory,
  selectedCategory,
}) => {
  const categoryClass =
    selectedCategory === category
      ? "bg-orange-400 text-white font-semibold px-4 py-1 border border-orange-400 rounded-xl flex-shrink-0 cursor-pointer"
      : "px-4 py-1 font-semibold border border-black rounded-xl flex-shrink-0 cursor-pointer";
  return <div id={`${category}`} className={categoryClass} onClick={(e) => setSelectedCategory(e.target.id)}>{category}</div>;
};

export default CategoryCustomer;
