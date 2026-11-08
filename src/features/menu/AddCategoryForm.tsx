import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import type { Station } from "./categoriesApi";
import { defaultVatRate, type CategoryFieldError } from "./categoryVat";
import StationSelect from "./StationSelect";
import VatRateSelect from "./VatRateSelect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { categorySchema, type CategoryValues } from "@/lib/schemas";

/**
 * Adds a menu section. Keeps the last station and VAT rate picked, since
 * sections usually come in runs. The rate follows the station until the owner picks one.
 */
const AddCategoryForm = ({ onAdd }: { onAdd: (values: CategoryValues) => Promise<CategoryFieldError | null> }) => {
  const [vatChosen, setVatChosen] = useState(false);
  const form = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", station: "kitchen", vatRate: defaultVatRate("kitchen") },
  });

  const handleStationChange = (station: Station) => {
    form.setValue("station", station);
    if (!vatChosen) {
      form.setValue("vatRate", defaultVatRate(station));
    }
  };

  const handleAdd = async (values: CategoryValues) => {
    const error = await onAdd(values);
    if (error) {
      form.setError(error.field, { message: error.message });
      return;
    }
    form.reset({ name: "", station: values.station, vatRate: values.vatRate });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleAdd)} className="flex flex-wrap items-start gap-2">
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
              <StationSelect label="Station for the new category" value={field.value} onChange={handleStationChange} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="vatRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>VAT rate</FormLabel>
              <VatRateSelect
                label="VAT rate for the new category"
                value={field.value}
                onChange={(rate) => {
                  setVatChosen(true);
                  field.onChange(rate);
                }}
              />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="mt-7">
          <Plus aria-hidden="true" />
          Add
        </Button>
      </form>
    </Form>
  );
};

export default AddCategoryForm;
