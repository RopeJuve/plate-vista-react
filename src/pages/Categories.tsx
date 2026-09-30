import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { Header } from "../Components/AdminComponents";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { categorySchema, type CategoryValues } from "@/lib/schemas";
import { apiMessage, notify } from "../utils/notify";
import {
  createCategory,
  deleteCategory,
  fetchCategoryList,
  moveCategory,
  updateCategory,
  type Category,
  type Station,
} from "../features/menu/categoriesApi";

const StationSelect = ({ value, onChange, label }: { value: Station; onChange: (value: Station) => void; label: string }) => (
  <Select value={value} onValueChange={(next) => onChange(next as Station)}>
    <SelectTrigger aria-label={label} className="h-9 w-28">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="kitchen">Kitchen</SelectItem>
      <SelectItem value="bar">Bar</SelectItem>
    </SelectContent>
  </Select>
);

const CategoryRow = ({
  category,
  first,
  last,
  onChanged,
  onListChanged,
  onDeleted,
}: {
  category: Category;
  first: boolean;
  last: boolean;
  onChanged: (category: Category) => void;
  onListChanged: (categories: Category[]) => void;
  onDeleted: (id: string) => void;
}) => {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(category.name);

  const run = async (action: () => Promise<void>, fallback: string) => {
    try {
      await action();
    } catch (error) {
      notify(apiMessage(error, fallback));
    }
  };

  const saveName = () =>
    run(async () => {
      onChanged(await updateCategory(category._id, { name }));
      setRenaming(false);
    }, "Could not rename the category");

  return (
    <li className="flex flex-wrap items-center gap-2 border-b border-dashed border-ink/10 py-3">
      <div className="flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={first}
          aria-label={`Move ${category.name} up`}
          onClick={() => run(async () => onListChanged(await moveCategory(category._id, "up")), "Could not move it")}
        >
          <ArrowUp aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={last}
          aria-label={`Move ${category.name} down`}
          onClick={() => run(async () => onListChanged(await moveCategory(category._id, "down")), "Could not move it")}
        >
          <ArrowDown aria-hidden="true" />
        </Button>
      </div>
      {renaming ? (
        <div className="flex min-w-0 flex-1 gap-1">
          <Input
            aria-label={`New name for ${category.name}`}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void saveName();
              if (event.key === "Escape") setRenaming(false);
            }}
            autoFocus
            className="h-9"
          />
          <Button type="button" variant="ghost" size="icon" aria-label="Save name" onClick={() => void saveName()}>
            <Check aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Cancel rename"
            onClick={() => {
              setName(category.name);
              setRenaming(false);
            }}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <span className="min-w-0 flex-1 truncate font-semibold">{category.name}</span>
      )}
      <StationSelect
        label={`Station for ${category.name}`}
        value={category.station}
        onChange={(station) =>
          run(async () => onChanged(await updateCategory(category._id, { station })), "Could not change the station")
        }
      />
      {!renaming && (
        <Button type="button" variant="ghost" size="icon" aria-label={`Rename ${category.name}`} onClick={() => setRenaming(true)}>
          <Pencil aria-hidden="true" />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-ink-soft hover:bg-alert/10 hover:text-alert-ink"
        aria-label={`Delete ${category.name}`}
        onClick={() => {
          if (!window.confirm(`Delete the category "${category.name}"?`)) return;
          void run(async () => {
            await deleteCategory(category._id);
            onDeleted(category._id);
          }, "Could not delete the category");
        }}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </li>
  );
};

// Menu sections in the order guests see them. The station decides where each
// item in the category is prepared.
const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", station: "kitchen" },
  });

  useEffect(() => {
    fetchCategoryList()
      .then(setCategories)
      .catch((error) => notify(apiMessage(error, "Could not load categories")));
  }, []);

  const handleAdd = async (values: CategoryValues) => {
    try {
      const created = await createCategory(values);
      setCategories((current) => [...current, created]);
      form.reset({ name: "", station: values.station });
    } catch (error) {
      form.setError("name", { message: apiMessage(error, "Could not add the category") });
    }
  };

  return (
    <div>
      <Header
        title="Categories"
        description="Menu sections in the order guests see them. Bar categories send their orders to the bar, kitchen categories to the kitchen."
      />
      <section className="max-w-2xl rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleAdd)} className="flex flex-wrap items-end gap-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="min-w-[12rem] flex-1">
                  <FormLabel>New category</FormLabel>
                  <FormControl>
                    <Input placeholder="Cocktails" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="station"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Station</FormLabel>
                  <StationSelect label="Station for the new category" value={field.value} onChange={field.onChange} />
                </FormItem>
              )}
            />
            <Button type="submit">
              <Plus aria-hidden="true" />
              Add
            </Button>
          </form>
        </Form>

        <ol className="mt-4" aria-label="Categories in menu order">
          {categories.map((category, index) => (
            <CategoryRow
              key={category._id}
              category={category}
              first={index === 0}
              last={index === categories.length - 1}
              onChanged={(updated) =>
                setCategories((current) => current.map((item) => (item._id === updated._id ? updated : item)))
              }
              onListChanged={setCategories}
              onDeleted={(id) => setCategories((current) => current.filter((item) => item._id !== id))}
            />
          ))}
        </ol>
        {categories.length === 0 && <p className="mt-6 text-center text-sm text-ink-soft">No categories yet.</p>}
      </section>
    </div>
  );
};

export default Categories;
