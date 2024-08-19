import React, { useState } from "react";
import { DialogComponent } from "@syncfusion/ej2-react-popups";
import { TextBox } from "@syncfusion/ej2-react-inputs";
import { menuItems as initialMenuItems } from "../data/data";

const Menu = () => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editInfo, setEditInfo] = useState({
    title: "",
    price: "",
    num_sold: "",
    in_stock: "",
    discount: "",
    label: "",
    description: '',
    image: '',
  });
  const [newItemInfo, setNewItemInfo] = useState({
    title: "",
    price: "",
    num_sold: "",
    in_stock: "",
    discount: "",
    label: "",
    description: '',
    image: '',
  });

  const [menuItems, setMenuItems] = useState(initialMenuItems);

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

  const handleSave = () => {
    // Save logic here
    console.log("Updated Info:", editInfo);
    closeDialog();
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    setNewItemInfo({ ...newItemInfo, [name]: value });
  };

  const handleAddNewItem = () => {
    setMenuItems([...menuItems, newItemInfo]);
    setNewItemInfo({
      title: "",
      price: "",
      num_sold: "",
      in_stock: "",
      discount: "",
      label: "",
      description: '',
      image: '',
    });
    setIsAddingNewItem(false);
  };

  return (
    <div className="flex justify-center p-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 m-12">
        <div className="e-card e-card-horizontal rounded-lg shadow-lg flex items-center justify-center bg-gray-200 cursor-pointer hover:bg-gray-300 transition-colors">
          <button
            className="p-4 text-center text-lg font-semibold text-gray-700"
            onClick={openAddNewItemDialog}
          >
            Add New Item
          </button>
        </div>
        {menuItems.map((item, index) => (
          <div
            className="e-card e-card-horizontal rounded-lg shadow-lg overflow-hidden"
            key={index}
          >
            <div className="e-card-image">Image</div>
            <div className="e-card-stacked">
              <div className="e-card-header">
                <div className="e-card-header-caption">
                  <div className="e-card-title">Title: {item.title}</div>
                  <div className="e-card-sub-title">Price: {item.price}</div>
                  <div className="e-card-sub-title">Sold: {item.num_sold}</div>
                  <div className="e-card-sub-title">
                    In Stock: {item.in_stock}
                  </div>
                  <div className="e-card-sub-title">
                    Discount: {item.discount}
                  </div>
                  <div className="e-card-sub-title">Label: {item.label}</div>
                </div>
              </div>
              <div className="e-card-content">
                A short description of the dish, A short description of the
                dish, A short description of the dish
              </div>
              <div className="e-card-actions">
                <button className="e-btn e-outline e-primary" onClick={() => openDialog(item)}>Edit</button>
                <button className="e-btn e-outline e-primary">Delete</button>
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
            {
              click: closeDialog,
              buttonModel: { content: "Cancel" },
            },
          ]}
        >
          <div style={{ padding: "10px" }}>
            <div style={{ marginBottom: "10px" }}>
              <input
                name="title"
                value={editInfo.title}
                placeholder="Title"
                onChange={handleChange}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <input
                name="price"
                value={editInfo.price}
                placeholder="Price"
                onChange={handleChange}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <input
                name="num_sold"
                value={editInfo.num_sold}
                placeholder="Number Sold"
                onChange={handleChange}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <input
                name="in_stock"
                value={editInfo.in_stock}
                placeholder="In Stock"
                onChange={handleChange}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <input
                name="discount"
                value={editInfo.discount}
                placeholder="Discount"
                onChange={handleChange}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <input
                name="label"
                value={editInfo.label}
                placeholder="Label"
                onChange={handleChange}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <textarea
                name="description"
                value={editInfo.description}
                placeholder="Description"
                onChange={handleChange}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minHeight: "100px" }}
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
              <input
                name="title"
                value={newItemInfo.title}
                placeholder="Title"
                onChange={handleNewItemChange}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <input
                name="price"
                value={newItemInfo.price}
                placeholder="Price"
                onChange={handleNewItemChange}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <input
                name="num_sold"
                value={newItemInfo.num_sold}
                placeholder="Number Sold"
                onChange={handleNewItemChange}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <input
                name="in_stock"
                value={newItemInfo.in_stock}
                placeholder="In Stock"
                onChange={handleNewItemChange}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <input
                name="discount"
                value={newItemInfo.discount}
                placeholder="Discount"
                onChange={handleNewItemChange}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <input
                name="label"
                value={newItemInfo.label}
                placeholder="Label"
                onChange={handleNewItemChange}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <textarea
                name="description"
                value={newItemInfo.description}
                placeholder="Description"
                onChange={handleNewItemChange}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", minHeight: "100px" }}
              />
            </div>
          </div>
        </DialogComponent>
      )}
    </div>
  );
};

export default Menu;
