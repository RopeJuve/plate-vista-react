import React, { useState, useEffect } from "react";
import { DialogComponent } from "@syncfusion/ej2-react-popups";
import {
  TextBoxComponent,
  TextAreaComponent,
  UploaderComponent,
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
import { useAuth } from "../contexts/AuthContext";
import { notify } from "../utils/notify";

const EDITABLE_FIELDS = [
  "title",
  "description",
  "price",
  "image",
  "category",
  "popular",
  "inStock",
];

const emptyItem = {
  title: "",
  price: "",
  category: "",
  description: "",
  image: "",
  popular: false,
  inStock: true,
};

const appendEditableFields = (formData, info) => {
  EDITABLE_FIELDS.forEach((key) => {
    if (key === "image" && (!info.image || typeof info.image === "string")) {
      if (typeof info.image === "string" && info.image) {
        formData.append("image", info.image);
      }
      return;
    }
    if (info[key] === undefined || info[key] === null) {
      return;
    }
    formData.append(key, info[key]);
  });
};

const Menu = () => {
  const { currentColor } = useStateContext();
  const { restaurantId } = useAuth();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editInfo, setEditInfo] = useState(emptyItem);
  const [newItemInfo, setNewItemInfo] = useState(emptyItem);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchMenuItems(restaurantId)
      .then((response) => setMenuItems(response.data))
      .catch((error) =>
        notify(error.response?.data?.message || "Could not load menu items")
      );

    fetchCategories(restaurantId)
      .then((response) => setCategories(response.data))
      .catch((error) =>
        notify(error.response?.data?.message || "Could not load categories")
      );
  }, [restaurantId]);

  const openDialog = (item) => {
    setSelectedItem(item);
    setEditInfo({
      title: item.title || "",
      price: item.price || "",
      category: item.category || "",
      description: item.description || "",
      image: item.image || "",
      popular: Boolean(item.popular),
      inStock: item.inStock !== false,
    });
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
    const { name, value, files, type, checked } = e.target;
    if (name === "image" && files && files[0]) {
      setEditInfo((prev) => ({
        ...prev,
        image: files[0],
      }));
      return;
    }
    setEditInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    if (!selectedItem) {
      return;
    }
    try {
      const formData = new FormData();
      appendEditableFields(formData, editInfo);
      const response = await updateMenuItem(
        selectedItem._id,
        formData,
        restaurantId
      );
      setMenuItems((prev) =>
        prev.map((item) =>
          item._id === selectedItem._id ? response.data : item
        )
      );
      setEditInfo(emptyItem);
      setDialogVisible(false);
      notify("Menu item updated", "success");
    } catch (error) {
      notify(error.response?.data?.message || "Could not save menu item");
    }
  };

  const handleNewItemChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewItemInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddNewItem = async () => {
    try {
      const formData = new FormData();
      appendEditableFields(formData, newItemInfo);
      const response = await addMenuItem(formData, restaurantId);
      setMenuItems((prev) => [...prev, response.data]);
      setNewItemInfo(emptyItem);
      setIsAddingNewItem(false);
      notify("Menu item added", "success");
    } catch (error) {
      notify(error.response?.data?.message || "Could not add menu item");
    }
  };

  const handleDelete = async (itemToDelete) => {
    const confirmed = window.confirm(`Delete "${itemToDelete.title}"?`);
    if (!confirmed) {
      return;
    }
    try {
      await deleteMenuItem(itemToDelete._id, restaurantId);
      setMenuItems((prev) =>
        prev.filter((item) => item._id !== itemToDelete._id)
      );
      notify("Menu item deleted", "success");
    } catch (error) {
      notify(error.response?.data?.message || "Could not delete menu item");
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
          {categories.map((category) => (
            <button
              key={category}
              type="button"
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
        {filteredMenuItems.map((item) => (
          <div
            className="e-card e-card-horizontal rounded-lg shadow-lg overflow-hidden"
            key={item._id}
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
                  <div className="e-card-sub-title">
                    {item.inStock === false ? "Out of stock" : "In stock"}
                    {item.popular ? " · Popular" : ""}
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
              <UploaderComponent
                name="image"
                success={(args) => {
                  if (args.file) {
                    handleChange({
                      target: {
                        name: "image",
                        files: [args.file],
                      },
                    });
                  }
                }}
                selected={(args) => {
                  if (args.filesData && args.filesData.length > 0) {
                    handleChange({
                      target: {
                        name: "image",
                        files: [args.filesData[0].rawFile],
                      },
                    });
                  }
                }}
                allowedExtensions=".jpg,.jpeg,.png,.webp"
                maxFileSize={5000000} // 5MB
                multiple={false}
                showFileList={true}
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
            <label className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                name="inStock"
                checked={Boolean(editInfo.inStock)}
                onChange={handleChange}
              />
              In stock
            </label>
            <label className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                name="popular"
                checked={Boolean(editInfo.popular)}
                onChange={handleChange}
              />
              Popular
            </label>
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
            <label className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                name="inStock"
                checked={Boolean(newItemInfo.inStock)}
                onChange={handleNewItemChange}
              />
              In stock
            </label>
            <label className="mb-2 flex items-center gap-2">
              <input
                type="checkbox"
                name="popular"
                checked={Boolean(newItemInfo.popular)}
                onChange={handleNewItemChange}
              />
              Popular
            </label>
          </div>
        </DialogComponent>
      )}
    </div>
  );
};

export default Menu;
