import React from "react";

const CategoryItem = ({ categoryName, setCategory }) => {
  return (
    <button
      className={`text-center flex items-center justify-center rounded-lg bg-blue-500`}
      onClick={() => setCategory(categoryName)}
    >
      {categoryName}
    </button>
  );
};

export default CategoryItem;
