import { useForm, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { LegalDetails } from "../../shared/api/payments";
import { toLegalValues, type LegalField, type LegalFieldError } from "./legalDetails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { legalDetailsSchema, type LegalDetailsValues } from "@/lib/schemas";

type TextFieldProps = {
  control: Control<LegalDetailsValues>;
  name: LegalField;
  label: string;
  className?: string;
  inputMode?: "numeric";
  autoComplete?: string;
};

const TextField = ({ control, name, label, className, inputMode, autoComplete }: TextFieldProps) => (
  <FormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input inputMode={inputMode} autoComplete={autoComplete} {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

/** The business details printed on every receipt, which the TSE also needs before it can be switched on. */
const LegalDetailsForm = ({
  details,
  onSave,
}: {
  details: LegalDetails | null;
  onSave: (values: LegalDetailsValues) => Promise<LegalFieldError[]>;
}) => {
  const form = useForm<LegalDetailsValues>({
    resolver: zodResolver(legalDetailsSchema),
    defaultValues: toLegalValues(details),
  });
  const { control, formState } = form;

  const handleSave = async (values: LegalDetailsValues) => {
    const errors = await onSave(values);
    errors.forEach(({ field, message }) => form.setError(field, { message }));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} noValidate className="grid grid-cols-1 gap-4 sm:grid-cols-6">
        <TextField control={control} name="legalName" label="Legal name" autoComplete="organization" className="sm:col-span-6" />
        <TextField control={control} name="street" label="Street and number" autoComplete="street-address" className="sm:col-span-6" />
        <TextField control={control} name="zip" label="ZIP" inputMode="numeric" autoComplete="postal-code" className="sm:col-span-2" />
        <TextField control={control} name="city" label="City" autoComplete="address-level2" className="sm:col-span-4" />
        <div className="sm:col-span-6">
          <p className="text-sm font-medium text-ink">Country</p>
          <p className="mt-1 text-sm text-ink-soft">Germany</p>
        </div>
        <TextField control={control} name="taxNumber" label="Tax number" className="sm:col-span-3" />
        <TextField control={control} name="vatId" label="VAT ID" className="sm:col-span-3" />
        <p className="text-sm text-ink-soft sm:col-span-6">A tax number or a VAT ID is enough; receipts show whichever you enter.</p>
        <div className="sm:col-span-6">
          <Button type="submit" disabled={formState.isSubmitting} className="w-full sm:w-auto" aria-label="Save legal details">
            {formState.isSubmitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LegalDetailsForm;
