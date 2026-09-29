import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  fetchMenuItems,
  updateMenuItem,
  addMenuItem,
  deleteMenuItem,
  fetchCategories,
} from "../services/menuDataFetch";
import { ImageOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Header } from "../Components/AdminComponents";
import { cn } from "@/lib/utils";
import { notify, apiMessage } from "../utils/notify";
import { formatCents, readCents } from "../shared/money/formatCents";
import { ImageUpload } from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  menuItemAddSchema,
  menuItemSchema,
  type MenuItemAddValues,
  type MenuItemValues,
} from "@/lib/schemas";
import type { MenuItem } from "@/types";
import { readItemId, toCategoryList, unwrapList } from "../features/guest-ordering/menu";

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

const EDITABLE_FIELDS = [
  "title",
  "description",
  "price",
  "image",
  "category",
  "popular",
  "inStock",
] as const;

const MENU_CATEGORIES = [
  "beer",
  "burgers",
  "cold drinks",
  "desserts",
  "hot drinks",
  "pizza",
  "salads",
  "wine",
];

const emptyItem: MenuItemValues = {
  title: "",
  price: undefined as unknown as number,
  category: "",
  description: "",
  image: "",
  popular: false,
  inStock: true,
};

const CategorySelect = ({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}) => {
  const choices = value && !options.includes(value) ? [value, ...options] : options;

  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <FormControl>
        <SelectTrigger aria-label={placeholder}>
          <SelectValue placeholder={choices.length ? placeholder : "No categories yet"} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {choices.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const toMenuItemBody = (info: MenuItemValues | MenuItemAddValues) => ({
  title: info.title,
  description: info.description ?? "",
  price: info.price,
  image: typeof info.image === "string" ? info.image : "",
  category: info.category,
  popular: info.popular,
  inStock: info.inStock,
});

const toMenuItemFormData = (info: MenuItemValues | MenuItemAddValues) => {
  const formData = new FormData();
  const body = toMenuItemBody(info);
  EDITABLE_FIELDS.forEach((key) => {
    if (key === "image" && info.image instanceof File) {
      formData.append("image", info.image);
      return;
    }
    const value = body[key];
    if (value === undefined || value === null) {
      return;
    }
    formData.append(key, String(value));
  });
  return formData;
};

const Menu = () => {
  const { restaurantId } = useAuth();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const editForm = useForm<MenuItemValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: emptyItem,
  });

  const addForm = useForm<MenuItemAddValues>({
    resolver: zodResolver(menuItemAddSchema),
    defaultValues: emptyItem,
  });

  useEffect(() => {
    fetchMenuItems(restaurantId)
      .then((response) => setMenuItems(toMenuItemList(response.data)))
      .catch((error) =>
        notify(apiMessage(error, "Could not load menu items"))
      );

    fetchCategories(restaurantId)
      .then((response) => setCategories(toCategoryList(response.data)))
      .catch((error) =>
        notify(apiMessage(error, "Could not load categories"))
      );
  }, [restaurantId]);

  const loadedCategories = useMemo(() => {
    const names = new Set<string>();
    categories.forEach((category) => {
      if (category) {
        names.add(category);
      }
    });
    menuItems.forEach((item) => {
      if (item.category) {
        names.add(item.category);
      }
    });
    return [...names];
  }, [categories, menuItems]);

  const categoryOptions = loadedCategories.length > 0 ? loadedCategories : MENU_CATEGORIES;

  const openDialog = (item: MenuItem) => {
    setSelectedItem(item);
    editForm.reset({
      title: item.title || "",
      price: Number(item.price) || (undefined as unknown as number),
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
    addForm.reset(emptyItem);
    setIsAddingNewItem(true);
  };

  const closeAddNewItemDialog = () => {
    setIsAddingNewItem(false);
  };

  const handleSave = async (values: MenuItemValues) => {
    if (!selectedItem) {
      return;
    }
    try {
      const payload = values.image instanceof File ? toMenuItemFormData(values) : toMenuItemBody(values);
      const response = await updateMenuItem(
        selectedItem._id,
        payload,
        restaurantId
      );
      setMenuItems((prev) =>
        prev.map((item) =>
          item._id === selectedItem._id ? response.data : item
        )
      );
      editForm.reset(emptyItem);
      setDialogVisible(false);
      notify("Menu item updated", "success");
    } catch (error) {
      notify(apiMessage(error, "Could not save menu item"));
    }
  };

  const handleAddNewItem = async (values: MenuItemAddValues) => {
    try {
      const response = await addMenuItem(toMenuItemBody(values), restaurantId);
      setMenuItems((prev) => [...prev, response.data]);
      addForm.reset(emptyItem);
      setIsAddingNewItem(false);
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
      setMenuItems((prev) =>
        prev.filter((item) => item._id !== itemToDelete._id)
      );
      notify("Menu item deleted", "success");
    } catch (error) {
      notify(apiMessage(error, "Could not delete menu item"));
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
  };

  const filteredMenuItems = menuItems.filter((item) =>
    selectedCategory ? item.category === selectedCategory : true
  );

  return (
    <div>
      <Header
        title="Menu"
        description={`${menuItems.length} ${menuItems.length === 1 ? "item" : "items"} on the menu.`}
        actions={
          <Button type="button" onClick={openAddNewItemDialog}>
            <Plus aria-hidden="true" />
            Add New Item
          </Button>
        }
      />

      <div role="tablist" aria-label="Filter by category" className="no-scrollbar -mx-1 mb-6 flex gap-2 overflow-x-auto px-1 pb-1">
        {["", ...loadedCategories].map((category) => {
          const active = selectedCategory === category;
          return (
            <button
              key={category || "all"}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => handleCategoryClick(category)}
              className={cn(
                "h-10 shrink-0 rounded-full px-4 text-sm font-bold capitalize transition-colors",
                active ? "bg-ink text-paper" : "bg-white text-ink/70 ring-1 ring-inset ring-ink/10 hover:text-ink hover:ring-ink/25"
              )}
            >
              {category || "All"}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-4">
        {filteredMenuItems.map((item) => {
          const soldOut = item.inStock === false;
          return (
            <article
              key={item._id}
              className="flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-ink/[0.07]"
            >
              <div className="relative aspect-[4/3] bg-paper-deep">
                {item.image ? (
                  <img src={item.image} alt="" loading="lazy" className={cn("h-full w-full object-cover", soldOut && "grayscale")} />
                ) : (
                  <div className="grid h-full place-items-center text-ink/25">
                    <ImageOff className="h-8 w-8" aria-hidden="true" />
                  </div>
                )}
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
                  <Button type="button" variant="outline" size="sm" className="flex-1 border-ink/15" onClick={() => openDialog(item)}>
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
          onClick={openAddNewItemDialog}
          aria-label="Add new menu item"
          className="flex min-h-[14rem] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ink/15 text-ink-soft transition-colors hover:border-signal hover:text-signal-ink"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
          <span className="font-bold">Add New Item</span>
        </button>
      </div>

      <Dialog open={dialogVisible} onOpenChange={setDialogVisible}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit menu item</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleSave)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Margherita" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="font-mono"
                        placeholder="9.50"
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value === "" ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <ImageUpload value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <CategorySelect
                      value={field.value}
                      onChange={field.onChange}
                      options={categoryOptions}
                      placeholder="Select Category"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What's in it, how it's served" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="inStock"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-[hsl(var(--signal))]"
                        checked={Boolean(field.value)}
                        onChange={(event) => field.onChange(event.target.checked)}
                      />
                    </FormControl>
                    <FormLabel>In stock</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="popular"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-[hsl(var(--signal))]"
                        checked={Boolean(field.value)}
                        onChange={(event) => field.onChange(event.target.checked)}
                      />
                    </FormControl>
                    <FormLabel>Popular</FormLabel>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Save</Button>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddingNewItem} onOpenChange={setIsAddingNewItem}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New menu item</DialogTitle>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddNewItem)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://…"
                        aria-label="Image URL"
                        value={typeof field.value === "string" ? field.value : ""}
                        onChange={(event) => field.onChange(event.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Margherita" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (€)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className="font-mono"
                        placeholder="9.50"
                        value={field.value ?? ""}
                        onChange={(event) => field.onChange(event.target.value === "" ? undefined : Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <CategorySelect
                      value={field.value}
                      onChange={field.onChange}
                      options={categoryOptions}
                      placeholder="Category"
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What's in it, how it's served" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="inStock"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-[hsl(var(--signal))]"
                        checked={Boolean(field.value)}
                        onChange={(event) => field.onChange(event.target.checked)}
                      />
                    </FormControl>
                    <FormLabel>In stock</FormLabel>
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="popular"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-5 w-5 accent-[hsl(var(--signal))]"
                        checked={Boolean(field.value)}
                        onChange={(event) => field.onChange(event.target.checked)}
                      />
                    </FormControl>
                    <FormLabel>Popular</FormLabel>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Add</Button>
                <Button type="button" variant="outline" onClick={closeAddNewItemDialog}>
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Menu;
