import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { restaurantRegisterSchema, type RestaurantRegisterValues } from "@/lib/schemas";
import { markOnboarding } from "./onboarding";
import { OWNER_LOGIN_PATH, rememberLoginKind } from "../../shared/auth/loginPaths";
import { readRestaurantIdFromUnknown, readTokenFromHeaders } from "../../shared/api/jwt";
import AuthShell from "../../Components/AdminComponents/Auth/AuthShell";
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

const RestaurantRegister = () => {
  const navigate = useNavigate();
  const { login, setRestaurantSlug } = useAuth();
  const [serverError, setServerError] = useState("");
  const form = useForm<RestaurantRegisterValues>({
    resolver: zodResolver(restaurantRegisterSchema),
    defaultValues: {
      restaurantName: "",
      slug: "",
      employee: "",
      email: "",
      password: "",
    },
  });

  const handleRegister = async (values: RestaurantRegisterValues) => {
    setServerError("");
    try {
      const response = await api.post("/auth/register", {
        restaurantName: values.restaurantName,
        slug: values.slug,
        employee: values.employee,
        email: values.email,
        password: values.password,
      });
      setRestaurantSlug(response.data?.slug || values.slug);
      const loggedIn = login(
        response.data ?? {},
        { position: "admin", employee: values.employee, email: values.email, role: "admin" },
        readRestaurantIdFromUnknown(response.data),
        readTokenFromHeaders(response.headers)
      );
      if (!loggedIn) {
        setServerError("Account created, but no login token was returned.");
        return;
      }
      rememberLoginKind("owner");
      markOnboarding();
      navigate("/admin/overview");
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setServerError(message || "Registration failed. Please try again.");
    }
  };

  return (
    <AuthShell>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
          <div className="pb-1">
            <h1 className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em]">Create your restaurant</h1>
            <p className="mt-1 text-ink-soft">You’ll be the owner. Add tables, menu and staff next.</p>
          </div>
          {serverError && (
            <p className="rounded-md bg-alert/10 px-3 py-2 text-sm font-semibold text-alert-ink" role="alert">
              {serverError}
            </p>
          )}
          {(
            [
              ["restaurantName", "Restaurant name", "text"],
              ["slug", "URL slug", "text"],
              ["employee", "Your name", "text"],
              ["email", "Email", "email"],
              ["password", "Password", "password"],
            ] as const
          ).map(([name, label, type]) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{label}</FormLabel>
                  <FormControl>
                    <Input
                      type={type}
                      autoComplete={name === "password" ? "new-password" : "off"}
                      className={name === "slug" ? "font-mono" : undefined}
                      {...field}
                      onChange={(event) => {
                        if (name === "slug") {
                          field.onChange(event.target.value.toLowerCase().replace(/\s+/g, "-"));
                          return;
                        }
                        field.onChange(event.target.value);
                      }}
                    />
                  </FormControl>
                  {name === "slug" && (
                    <p className="text-xs text-ink-soft">
                      Guests’ links look like <span className="font-mono">/r/{field.value || "your-slug"}/t/…</span>
                    </p>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button type="submit" size="lg" className="w-full">
            Create restaurant
          </Button>
          <p className="text-center text-sm text-ink-soft">
            Already have an account?{" "}
            <Link to={OWNER_LOGIN_PATH} className="font-semibold text-ink underline decoration-signal decoration-2 hover:text-signal-ink">
              Log in
            </Link>
          </p>
        </form>
      </Form>
    </AuthShell>
  );
};

export default RestaurantRegister;
