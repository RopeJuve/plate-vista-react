import React, { useState, useEffect } from "react";
import { DialogComponent } from "@syncfusion/ej2-react-popups";
import {
  TextBoxComponent,
  TextAreaComponent,
} from "@syncfusion/ej2-react-inputs";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import {
  fetchMenuItems,
  updateMenuItem,
  addMenuItem,
  deleteMenuItem,
  fetchCategories,
} from "../services/menuDataFetch";
import { useStateContext } from "../contexts/ContextProvider";

const Menu = () => {
  const { currentColor } = useStateContext();

  const [dialogVisible, setDialogVisible] = useState(false);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editInfo, setEditInfo] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
    image: "",
  });
  const [newItemInfo, setNewItemInfo] = useState({
    title: "",
    price: 0,
    category: "",
    description: "",
    image: "",
  });
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchMenuItems()
      .then((response) => setMenuItems(response.data))
      .catch((error) => console.error("Error fetching menu items:", error));

    fetchCategories()
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  const openDialog = (item) => {
    setSelectedItem(item);
    setEditInfo(item);
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
  };

  const openAddNewItemDialog = () => {
    setIsAddingNewItem(true);
  };

  const closeAddNewItemDialog = () => {
    setIsAddingNewItem(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditInfo({ ...editInfo, [name]: value });
  };

  const handleSave = async () => {
    if (selectedItem) {
      try {
        const response = await updateMenuItem(selectedItem._id, editInfo);
        const updatedMenuItems = menuItems.map((item) =>
          item._id === selectedItem._id ? response.data : item
        );
        setMenuItems(updatedMenuItems);
        setEditInfo({
          title: "",
          price: "",
          category: "",
          description: "",
          image: "",
        });
        setDialogVisible(false);
      } catch (error) {
        console.error("Error saving item:", error);
      }
    }
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItemInfo({ ...newItemInfo, [name]: value });
  };

  const handleAddNewItem = async () => {
    try {
      const response = await addMenuItem(newItemInfo);
      setMenuItems([...menuItems, response.data]);
      setNewItemInfo({
        title: "",
        price: 0,
        category: "",
        description: "",
        image: "",
      });
      setIsAddingNewItem(false);
    } catch (error) {
      console.error("Error adding new item:", error);
    }
  };

  const handleDelete = async (itemToDelete) => {
    try {
      await deleteMenuItem(itemToDelete._id);
      const updatedMenuItems = menuItems.filter(
        (item) => item._id !== itemToDelete._id
      );
      setMenuItems(updatedMenuItems);
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const filteredMenuItems = menuItems.filter((item) =>
    selectedCategory ? item.category === selectedCategory : true
  );

  return (
    <div className="flex flex-col p-8">
      <div className="mb-4">
        <div className="flex overflow-x-auto bg-gray-200 p-2 rounded-md shadow-md w-full">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => handleCategoryClick(category)}
              className={`flex-grow px-4 py-2 rounded-md mx-2 text-sm font-semibold text-center ${
                selectedCategory === category
                  ? "text-white"
                  : "text-gray-700 bg-white"
              } hover:bg-gray-300`}
              style={{
                backgroundColor:
                  selectedCategory === category ? currentColor : "",
              }}
            >
              {category}
            </button>
          ))}
          <button
            onClick={() => setSelectedCategory("")}
            className={`flex-grow px-4 py-2 rounded-md mx-2 text-sm font-semibold text-center ${
              selectedCategory === "" ? "text-white" : "text-gray-700 bg-white"
            } hover:bg-gray-300`}
            style={{
              backgroundColor: selectedCategory === "" ? currentColor : "",
            }}
          >
            All
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          onClick={openAddNewItemDialog}
          className="e-card e-card-horizontal rounded-lg shadow-lg flex items-center justify-center bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors"
        >
          <button className="p-4 text-center text-lg font-semibold text-gray-700">
            Add New Item
          </button>
        </div>
        {filteredMenuItems.map((item, index) => (
          <div
            className="e-card e-card-horizontal rounded-lg shadow-lg overflow-hidden"
            key={index}
          >
            <div className="e-card-image">
              <img
                src={item.image}
                alt={item.title}
                style={{ width: "100%", height: "auto" }}
              />
            </div>
            <div className="e-card-stacked">
              <div className="e-card-header">
                <div className="e-card-header-caption">
                  <div className="e-card-title">Title: {item.title}</div>
                  <div className="e-card-sub-title">Price: {item.price}</div>
                  <div className="e-card-sub-title">
                    Category: {item.category}
                  </div>
                </div>
              </div>
              <div className="e-card-content">{item.description}</div>
              <div className="e-card-actions">
                <button
                  className="e-btn e-outline"
                  onClick={() => openDialog(item)}
                  style={{
                    borderColor: currentColor,
                    color: currentColor,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = currentColor;
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = currentColor;
                  }}
                >
                  Edit
                </button>
                <button
                  className="e-btn e-outline"
                  onClick={() => handleDelete(item)}
                  style={{
                    borderColor: currentColor,
                    color: currentColor,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = currentColor;
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = currentColor;
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {dialogVisible && (
        <DialogComponent
          header="Edit Item Information"
          visible={dialogVisible}
          width="400px"
          showCloseIcon={true}
          close={closeDialog}
          buttons={[
            {
              click: handleSave,
              buttonModel: { content: "Save", isPrimary: true },
            },
            { click: closeDialog, buttonModel: { content: "Cancel" } },
          ]}
        >
          <div style={{ padding: "10px" }}>
            <div style={{ marginBottom: "10px" }}>
              <TextBoxComponent
                name="title"
                value={editInfo.title}
                placeholder="Title"
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <TextBoxComponent
                name="price"
                value={editInfo.price}
                placeholder="Price"
                onChange={handleChange}
                type="number"
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <DropDownListComponent
                name="category"
                dataSource={[
                  "beer",
                  "burgers",
                  "cold drinks",
                  "desserts",
                  "hot drinks",
                  "pizza",
                  "salads",
                  "wine",
                ]}
                value={editInfo.category}
                placeholder="Select Category"
                onChange={(e) =>
                  handleChange({ target: { name: "category", value: e.value } })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <TextAreaComponent
                name="description"
                value={editInfo.description}
                placeholder="Description"
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  minHeight: "100px",
                }}
              />
            </div>
          </div>
        </DialogComponent>
      )}

      {isAddingNewItem && (
        <DialogComponent
          header="Add New Item"
          visible={isAddingNewItem}
          width="400px"
          showCloseIcon={true}
          close={closeAddNewItemDialog}
          buttons={[
            {
              click: handleAddNewItem,
              buttonModel: { content: "Add", isPrimary: true },
            },
            {
              click: closeAddNewItemDialog,
              buttonModel: { content: "Cancel" },
            },
          ]}
        >
          <div style={{ padding: "10px" }}>
            <div style={{ marginBottom: "10px" }}>
              <TextBoxComponent
                name="image"
                value={newItemInfo.image}
                placeholder="Image"
                onChange={handleNewItemChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <TextBoxComponent
                name="title"
                value={newItemInfo.title}
                placeholder="Title"
                onChange={handleNewItemChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <TextBoxComponent
                name="price"
                value={newItemInfo.price}
                placeholder="Price"
                onChange={handleNewItemChange}
                type="number"
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <DropDownListComponent
                name="category"
                dataSource={[
                  "beer",
                  "burgers",
                  "cold drinks",
                  "desserts",
                  "hot drinks",
                  "pizza",
                  "salads",
                  "wine",
                ]}
                value={newItemInfo.category}
                placeholder="Category"
                onChange={(e) =>
                  handleNewItemChange({
                    target: { name: "category", value: e.value },
                  })
                }
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <TextAreaComponent
                name="description"
                value={newItemInfo.description}
                placeholder="Description"
                onChange={handleNewItemChange}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                  minHeight: "100px",
                }}
              />
            </div>
          </div>
        </DialogComponent>
      )}
    </div>
  );
};

export default Menu;
