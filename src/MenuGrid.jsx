import React, { useState } from "react";
import MenuItem from "./MenuItem";
import MenuItemDetail from "./MenuDetail";

function MenuGrid() {
  const menuItems = [
    {
      title: "Chicken Alfredo",
      price: "$21.49",
      calories: "1570",
      description:
        "Creamy alfredo sauce with grilled chicken and fettuccine pasta.",
      imageUrl: "https://via.placeholder.com/300x200", // Replace with your actual image URL
    },
    {
      title: "Chicken Parmigiana",
      price: "$21.29",
      calories: "1020",
      description:
        "Breaded chicken topped with marinara sauce and mozzarella cheese.",
      imageUrl: "https://via.placeholder.com/300x200", // Replace with your actual image URL
    },
    {
      title: "Shrimp Alfredo",
      price: "$24.99",
      calories: "1200",
      description: "Creamy alfredo sauce with shrimp and fettuccine pasta.",
      imageUrl: "https://via.placeholder.com/300x200", // Replace with your actual image URL
    },
    {
      title: "Shrimp Alfredo",
      price: "$24.99",
      calories: "1200",
      description: "Creamy alfredo sauce with shrimp and fettuccine pasta.",
      imageUrl: "https://via.placeholder.com/300x200", // Replace with your actual image URL
    },
    {
      title: "Shrimp Alfredo",
      price: "$24.99",
      calories: "1200",
      description: "Creamy alfredo sauce with shrimp and fettuccine pasta.",
      imageUrl: "https://via.placeholder.com/300x200", // Replace with your actual image URL
    },
    {
      title: "Shrimp Alfredo",
      price: "$24.99",
      calories: "1200",
      description: "Creamy alfredo sauce with shrimp and fettuccine pasta.",
      imageUrl: "https://via.placeholder.com/300x200", // Replace with your actual image URL
    },
    // Add more items as needed
  ];

  const [selectedItem, setSelectedItem] = useState(null);

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  return (
    <div className="relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
        {menuItems.map((item, index) => (
          <div key={index} onClick={() => handleItemClick(item)}>
            <MenuItem
              title={item.title}
              price={item.price}
              calories={item.calories}
              imageUrl={item.imageUrl}
            />
          </div>
        ))}
      </div>
      {selectedItem && (
        <MenuItemDetail item={selectedItem} onClose={handleCloseDetail} />
      )}
    </div>
  );
}

export default MenuGrid;
