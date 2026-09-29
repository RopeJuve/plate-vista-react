import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { staffLoginSchema, type StaffLoginValues } from "@/lib/schemas";
import { useSignIn } from "../../../shared/auth/useSignIn";
import {
  OWNER_LOGIN_PATH,
  normalizeSlug,
  rememberStaffRestaurant,
  rememberedStaffRestaurant,
} from "../../../shared/auth/loginPaths";
import AuthShell from "./AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Staff (bar, kitchen, admins) sign in inside one restaurant, because two
// restaurants may each have a "Maria". /staff/:slug/login fixes the
// restaurant; /staff/login asks for it. The device remembers it afterwards.
const StaffLogin = () => {
  const { slug: slugFromUrl } = useParams();
  const initialSlug = slugFromUrl ? normalizeSlug(slugFromUrl) : rememberedStaffRestaurant();
  const [editingRestaurant, setEditingRestaurant] = useState(!initialSlug);
  const { signIn, pending, message } = useSignIn("staff");
  const form = useForm<StaffLoginValues>({
    resolver: zodResolver(staffLoginSchema),
    defaultValues: { restaurant: initialSlug, username: "", password: "" },
  });

  const handleLogin = async (values: StaffLoginValues) => {
    const restaurant = normalizeSlug(values.restaurant);
    const ok = await signIn(
      "/auth/employee/login",
      { restaurant, employee: values.username, password: values.password },
      values.username
    );
    if (ok) rememberStaffRestaurant(restaurant);
  };

  return (
    <AuthShell>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-5">
          <div>
            <h1 className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em]">Staff sign in</h1>
            {editingRestaurant ? (
              <p className="mt-1 text-ink-soft">Enter your restaurant’s code, then your own login.</p>
            ) : (
              <p className="mt-1 text-ink-soft">
                Restaurant <span className="font-mono font-semibold text-ink">{form.getValues("restaurant")}</span>{" "}
                <button
                  type="button"
                  onClick={() => setEditingRestaurant(true)}
                  className="font-semibold text-ink underline decoration-signal decoration-2 hover:text-signal-ink"
                >
                  Change
                </button>
              </p>
            )}
          </div>
          {message && (
            <p className="rounded-md bg-alert/10 px-3 py-2 text-sm font-semibold text-alert-ink" role="alert">
              {message}
            </p>
          )}

          {editingRestaurant && (
            <FormField
              control={form.control}
              name="restaurant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Restaurant code</FormLabel>
                  <FormControl>
                    <Input
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      className="font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input autoComplete="username" autoCapitalize="none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? "Signing in…" : "Login"}
          </Button>
          <p className="text-center text-sm text-ink-soft">
            Restaurant owner?{" "}
            <Link to={OWNER_LOGIN_PATH} className="font-semibold text-ink underline decoration-signal decoration-2 hover:text-signal-ink">
              Owner sign in
            </Link>
          </p>
        </form>
      </Form>
    </AuthShell>
  );
};

export default StaffLogin;
