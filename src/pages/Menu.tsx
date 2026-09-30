import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchMenuItems, updateMenuItem, addMenuItem, deleteMenuItem } from "../services/menuDataFetch";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Header } from "../Components/AdminComponents";
import { cn } from "@/lib/utils";
import { notify, apiMessage } from "../utils/notify";
import { formatCents, readCents } from "../shared/money/formatCents";
import { Button } from "@/components/ui/button";
import ScrollRow from "../Components/ScrollRow";
import type { MenuItemValues } from "@/lib/schemas";
import type { MenuItem } from "@/types";
import { readItemId, unwrapList } from "../features/guest-ordering/menu";
import MenuItemDialog from "../features/menu/MenuItemDialog";
import MenuItemImage from "../features/menu/MenuItemImage";
import { fetchCategoryList, type Category } from "../features/menu/categoriesApi";

const toMenuItemList = (data: unknown): MenuItem[] =>
  unwrapList(data).flatMap((item) => {
    if (!item || typeof item !== "object") {
      return [];
    }
    const record = item as Record<string, unknown> & MenuItem;
    const id = readItemId(record);
    if (!id) {
      return [];
    }
    return [{ ...record, _id: id }];
  });

const EMPTY_MENU_ITEM: MenuItemValues = {
  title: "",
  price: undefined as unknown as number,
  categoryId: "",
  description: "",
  image: null,
  popular: false,
  inStock: true,
};

const toFormValues = (item: MenuItem): MenuItemValues => ({
  title: item.title || "",
  price: Number(item.price) || (undefined as unknown as number),
  categoryId: item.categoryId || "",
  description: item.description || "",
  image: item.image || null,
  popular: Boolean(item.popular),
  inStock: item.inStock !== false,
});

const Menu = () => {
  const { restaurantId } = useAuth();
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [adding, setAdding] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    fetchMenuItems(restaurantId)
      .then((response) => setMenuItems(toMenuItemList(response.data)))
      .catch((error) => notify(apiMessage(error, "Could not load menu items")));
    fetchCategoryList()
      .then(setCategories)
      .catch((error) => notify(apiMessage(error, "Could not load categories")));
  }, [restaurantId]);

  // Filter tabs: categories that have items, in menu order.
  const usedCategories = useMemo(
    () => categories.filter((category) => menuItems.some((item) => item.categoryId === category._id)),
    [categories, menuItems]
  );
  const editingValues = useMemo(() => (editing ? toFormValues(editing) : EMPTY_MENU_ITEM), [editing]);

  const handleSave = async (values: MenuItemValues) => {
    if (!editing) {
      return;
    }
    try {
      const response = await updateMenuItem(editing._id, values, restaurantId);
      setMenuItems((prev) => prev.map((item) => (item._id === editing._id ? response.data : item)));
      setEditing(null);
      notify("Menu item updated", "success");
    } catch (error) {
      notify(apiMessage(error, "Could not save menu item"));
    }
  };

  const handleAdd = async (values: MenuItemValues) => {
    try {
      const response = await addMenuItem(values, restaurantId);
      setMenuItems((prev) => [...prev, response.data]);
      setAdding(false);
      notify("Menu item added", "success");
    } catch (error) {
      notify(apiMessage(error, "Could not add menu item"));
    }
  };

  const handleDelete = async (itemToDelete: MenuItem) => {
    const confirmed = window.confirm(`Delete "${itemToDelete.title}"?`);
    if (!confirmed) {
      return;
    }
    try {
      await deleteMenuItem(itemToDelete._id, restaurantId);
      setMenuItems((prev) => prev.filter((item) => item._id !== itemToDelete._id));
      notify("Menu item deleted", "success");
    } catch (error) {
      notify(apiMessage(error, "Could not delete menu item"));
    }
  };

  const filteredMenuItems = menuItems.filter((item) =>
    selectedCategory ? item.categoryId === selectedCategory : true
  );

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
        <ScrollRow label="Filter by category" activeKey={selectedCategory} className="gap-2 px-1 pb-1">
          {[{ _id: "", name: "All" }, ...usedCategories].map((category) => {
            const active = selectedCategory === category._id;
            return (
              <button
                key={category._id || "all"}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(category._id)}
                className={cn(
                  "h-10 shrink-0 rounded-full px-4 text-sm font-bold transition-colors",
                  active ? "bg-ink text-paper" : "bg-white text-ink/70 ring-1 ring-inset ring-ink/10 hover:text-ink hover:ring-ink/25"
                )}
              >
                {category.name}
              </button>
            );
          })}
        </ScrollRow>
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
        {filteredMenuItems.map((item) => {
          const soldOut = item.inStock === false;
          return (
            <article
              key={item._id}
              className="flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-ink/[0.07]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-paper-deep">
                <MenuItemImage
                  image={item.image}
                  station={item.station}
                  dimmed={soldOut}
                  className="absolute inset-0 h-full w-full"
                />
                <div className="absolute left-2 top-2 flex gap-1.5">
                  {item.popular && (
                    <span className="rounded bg-signal px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-ink">
                      Popular
                    </span>
                  )}
                  {soldOut && (
                    <span className="rounded bg-ink px-1.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-paper">
                      Sold out
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-bold leading-snug">{item.title}</h3>
                  <span className="font-mono font-bold tabular">
                    {formatCents(readCents((item as { priceCents?: number }).priceCents, item.price))}
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.08em] text-ink-soft">{item.category}</p>
                {item.description && <p className="mt-2 line-clamp-2 text-sm text-ink-soft">{item.description}</p>}
                <div className="mt-auto flex gap-2 pt-4">
                  <Button type="button" variant="outline" size="sm" className="flex-1 border-ink/15" onClick={() => setEditing(item)}>
                    <Pencil aria-hidden="true" />
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-ink-soft hover:bg-alert/10 hover:text-alert-ink"
                    onClick={() => handleDelete(item)}
                    aria-label={`Delete ${item.title}`}
                  >
                    <Trash2 aria-hidden="true" />
                    Delete
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
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
