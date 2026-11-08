import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { Header } from "../Components/AdminComponents";
import AdminMenuItemCard from "../features/menu/AdminMenuItemCard";
import CategoryFilter from "../features/menu/CategoryFilter";
import MenuItemDialog from "../features/menu/MenuItemDialog";
import { useMenuItems } from "../features/menu/hooks/useMenuItems";
import { vatRateOf } from "../features/menu/categoryVat";
import { EMPTY_MENU_ITEM, categoriesInUse, itemsInCategory, toFormValues } from "../features/menu/menuItemForm";
import { Button } from "@/components/ui/button";
import type { MenuItemValues } from "@/lib/schemas";
import type { MenuItem } from "@/types";

/** The admin's menu: every dish, filtered by category, with add, edit and delete. */
const Menu = () => {
  const { menuItems, categories, addItem, saveItem, removeItem } = useMenuItems();
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const usedCategories = useMemo(() => categoriesInUse(categories, menuItems), [categories, menuItems]);
  const editingValues = useMemo(() => (editing ? toFormValues(editing) : EMPTY_MENU_ITEM), [editing]);

  const handleSave = async (values: MenuItemValues) => {
    if (editing && (await saveItem(editing._id, values))) {
      setEditing(null);
    }
  };

  const handleAdd = async (values: MenuItemValues) => {
    if (await addItem(values)) {
      setAdding(false);
    }
  };

  const handleDelete = (item: MenuItem) => {
    if (window.confirm(`Delete "${item.title}"?`)) {
      void removeItem(item._id);
    }
  };

  return (
    <div>
      <Header
        title="Menu"
        description={`${menuItems.length} ${menuItems.length === 1 ? "item" : "items"} on the menu.`}
        actions={
          <>
            <Button type="button" variant="outline" className="border-ink/15" asChild>
              <Link to="/admin/categories">Categories</Link>
            </Button>
            <Button type="button" onClick={() => setAdding(true)}>
              <Plus aria-hidden="true" />
              Add New Item
            </Button>
          </>
        }
      />

      <div className="mb-6">
        <CategoryFilter categories={usedCategories} selectedId={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
        {itemsInCategory(menuItems, selectedCategory).map((item) => (
          <AdminMenuItemCard
            key={item._id}
            item={item}
            vatRate={vatRateOf(categories, item.categoryId)}
            onEdit={setEditing}
            onDelete={handleDelete}
          />
        ))}
        <button
          type="button"
          onClick={() => setAdding(true)}
          aria-label="Add new menu item"
          className="flex min-h-[14rem] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/15 text-ink-soft transition-colors hover:border-signal hover:text-signal-ink"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
          <span className="font-bold">Add New Item</span>
        </button>
      </div>

      <MenuItemDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
        title="Edit menu item"
        submitLabel="Save"
        initial={editingValues}
        categories={categories}
        onSubmit={handleSave}
      />
      <MenuItemDialog
        open={adding}
        onOpenChange={setAdding}
        title="New menu item"
        submitLabel="Add"
        initial={EMPTY_MENU_ITEM}
        categories={categories}
        onSubmit={handleAdd}
      />
    </div>
  );
};

export default Menu;
