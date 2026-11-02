import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import StationSelect from "./StationSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { categorySchema, type CategoryValues } from "@/lib/schemas";

/** Adds a menu section. Keeps the last station picked, since sections usually come in runs. */
const AddCategoryForm = ({ onAdd }: { onAdd: (values: CategoryValues) => Promise<string | null> }) => {
  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", station: "kitchen" },
  });

  const handleAdd = async (values: CategoryValues) => {
    const error = await onAdd(values);
    if (error) {
      form.setError("name", { message: error });
      return;
    }
    form.reset({ name: "", station: values.station });
  };

  return (
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
  );
};

export default AddCategoryForm;
