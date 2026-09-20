import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { ImageUpload } from "@/components/ImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const appendEditableFields = (formData: FormData, info: MenuItemValues | MenuItemAddValues) => {
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
    formData.append(key, info[key] as string | Blob);
  });
};

const Menu = () => {
  const { currentColor } = useStateContext();
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
      const formData = new FormData();
      appendEditableFields(formData, values);
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
      editForm.reset(emptyItem);
      setDialogVisible(false);
      notify("Menu item updated", "success");
    } catch (error) {
      notify(error.response?.data?.message || "Could not save menu item");
    }
  };

  const handleAddNewItem = async (values: MenuItemAddValues) => {
    try {
      const formData = new FormData();
      appendEditableFields(formData, values);
      const response = await addMenuItem(formData, restaurantId);
      setMenuItems((prev) => [...prev, response.data]);
      addForm.reset(emptyItem);
      setIsAddingNewItem(false);
      notify("Menu item added", "success");
    } catch (error) {
      notify(error.response?.data?.message || "Could not add menu item");
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
      notify(error.response?.data?.message || "Could not delete menu item");
    }
  };

  const handleCategoryClick = (category: string) => {
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
            type="button"
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
        <Card
          onClick={openAddNewItemDialog}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              openAddNewItemDialog();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Add new menu item"
          className="flex cursor-pointer items-center justify-center bg-gray-200 transition-colors hover:bg-gray-300"
        >
          <CardContent className="p-4 text-center text-lg font-semibold text-gray-700">
            Add New Item
          </CardContent>
        </Card>
        {filteredMenuItems.map((item) => (
          <Card className="overflow-hidden" key={item._id}>
            <img
              src={item.image}
              alt={item.title}
              className="h-auto w-full"
            />
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Title: {item.title}</CardTitle>
              <p className="text-sm text-muted-foreground">Price: {item.price}</p>
              <p className="text-sm text-muted-foreground">Category: {item.category}</p>
              <p className="text-sm text-muted-foreground">
                {item.inStock === false ? "Out of stock" : "In stock"}
                {item.popular ? " · Popular" : ""}
              </p>
            </CardHeader>
            <CardContent className="p-4 pt-0">{item.description}</CardContent>
            <CardFooter className="flex gap-2 p-4 pt-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => openDialog(item)}
                style={{ borderColor: currentColor, color: currentColor }}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDelete(item)}
                style={{ borderColor: currentColor, color: currentColor }}
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={dialogVisible} onOpenChange={setDialogVisible}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Item Information</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleSave)} className="space-y-3">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Title" {...field} />
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
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Price"
                        value={field.value ?? ""}
                        onChange={field.onChange}
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MENU_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea placeholder="Description" {...field} />
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
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddNewItem)} className="space-y-3">
              <FormField
                control={addForm.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Image"
                        value={typeof field.value === "string" ? field.value : ""}
                        onChange={field.onChange}
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
                    <FormControl>
                      <Input placeholder="Title" {...field} />
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
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Price"
                        value={field.value ?? ""}
                        onChange={field.onChange}
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
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MENU_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea placeholder="Description" {...field} />
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
