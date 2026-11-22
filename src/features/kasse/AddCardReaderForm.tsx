import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cardReaderSchema, simulatedReaderSchema, type CardReaderValues } from "@/lib/schemas";

type AddCardReaderFormProps = {
  /** A Simulated Reader needs no registration code. */
  simulated: boolean;
  /** Resolves `null` once the reader is added, or the sentence saying why not. */
  onAdd: (values: CardReaderValues) => Promise<string | null>;
  onAdded: () => void;
};

/** The registration code a reader shows on screen and the name staff will know it by. */
const AddCardReaderForm = ({ simulated, onAdd, onAdded }: AddCardReaderFormProps) => {
  const [problem, setProblem] = useState<string | null>(null);
  const form = useForm<CardReaderValues>({
    resolver: zodResolver(simulated ? simulatedReaderSchema : cardReaderSchema),
    defaultValues: { registrationCode: "", name: "" },
  });
  const submitLabel = simulated ? "Add simulated reader" : "Add reader";

  const handleAdd = async (values: CardReaderValues) => {
    setProblem(null);
    const failure = await onAdd(values);
    if (failure) {
      setProblem(failure);
      return;
    }
    onAdded();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleAdd)} noValidate className="space-y-4">
        {!simulated && (
          <FormField
            control={form.control}
            name="registrationCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Registration code</FormLabel>
                <FormControl>
                  <Input autoComplete="off" autoCapitalize="none" spellCheck={false} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input autoComplete="off" maxLength={40} placeholder="Bar, Terrasse…" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {problem && (
          <p role="alert" className="text-sm text-red-700">
            {problem}
          </p>
        )}
        <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
          {form.formState.isSubmitting ? "Adding…" : submitLabel}
        </Button>
      </form>
    </Form>
  );
};

export default AddCardReaderForm;
