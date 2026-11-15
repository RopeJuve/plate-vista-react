import type { ReactNode } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { profileSchema, type ProfileValues } from "@/lib/schemas";
import DayHoursRow from "./DayHoursRow";
import LogoField from "./LogoField";
import { addressLine } from "./mapLinks";
import { toProfileValues, type ProfileFieldError } from "./profileForm";
import { WEEKDAYS, type RestaurantProfile } from "./types";

type ProfileFormProps = {
  profile: RestaurantProfile | null;
  onSave: (values: ProfileValues) => Promise<ProfileFieldError[]>;
};

const Section = ({ title, hint, children }: { title: string; hint: string; children: ReactNode }) => (
  <section className="space-y-3 border-t border-paper-line pt-5 first:border-t-0 first:pt-0">
    <div>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="text-sm text-ink-soft">{hint}</p>
    </div>
    {children}
  </section>
);

/** What guests see about the restaurant: the logo on top of their menu, the address and hours at its foot. */
const ProfileForm = ({ profile, onSave }: ProfileFormProps) => {
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toProfileValues(profile),
  });
  const { control, formState } = form;
  const useLegalAddress = useWatch({ control, name: "useLegalAddress" });

  const handleSave = async (values: ProfileValues) => {
    const errors = await onSave(values);
    errors.forEach(({ field, message }) => form.setError(field, { message }));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} noValidate className="space-y-6">
        <Section title="Logo" hint="Top left of the guest menu.">
          <FormField
            control={control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <LogoField value={field.value} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />
        </Section>

        <Section title="Address" hint="At the foot of the guest menu, with a link to Google Maps.">
          <FormField
            control={control}
            name="useLegalAddress"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm font-medium text-ink">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[hsl(var(--ink))]"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
                Use the legal address
              </label>
            )}
          />
          {useLegalAddress ? (
            <p className="text-sm text-ink-soft">
              {profile?.legalAddress
                ? addressLine(profile.legalAddress)
                : "No legal address yet. Add it under Till & payments, or enter the restaurant's address here."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-6">
              <FormField
                control={control}
                name="street"
                render={({ field }) => (
                  <FormItem className="sm:col-span-6">
                    <FormLabel>Street and number</FormLabel>
                    <FormControl>
                      <Input autoComplete="street-address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="zip"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>ZIP</FormLabel>
                    <FormControl>
                      <Input inputMode="numeric" autoComplete="postal-code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name="city"
                render={({ field }) => (
                  <FormItem className="sm:col-span-4">
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input autoComplete="address-level2" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </Section>

        <Section
          title="Opening hours"
          hint="In the restaurant's own time. Guests see whether you are open now; it never stops them ordering."
        >
          <div className="divide-y divide-paper-line">
            {WEEKDAYS.map((day) => (
              <FormField
                key={day}
                control={control}
                name={`openingHours.${day}`}
                render={({ field, fieldState }) => (
                  <DayHoursRow day={day} ranges={field.value} error={fieldState.error?.message} onChange={field.onChange} />
                )}
              />
            ))}
          </div>
        </Section>

        <Button type="submit" disabled={formState.isSubmitting} className="w-full sm:w-auto" aria-label="Save restaurant profile">
          {formState.isSubmitting ? "Saving…" : "Save"}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
