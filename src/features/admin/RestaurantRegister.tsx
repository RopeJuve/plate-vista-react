import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { restaurantRegisterSchema, type RestaurantRegisterValues } from "@/lib/schemas";
import { markOnboarding } from "./onboarding";
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
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");
  const form = useForm<RestaurantRegisterValues>({
    resolver: zodResolver(restaurantRegisterSchema),
    defaultValues: {
      restaurantName: "",
      slug: "",
      ownerName: "",
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
        ownerName: values.ownerName,
        email: values.email,
        password: values.password,
      });
      const rawHeader = response.headers?.authorization ?? response.headers?.Authorization;
      const headerToken =
        typeof rawHeader === "string"
          ? rawHeader.startsWith("Bearer ")
            ? rawHeader.slice(7)
            : rawHeader
          : "";
      const token = response.data?.token || response.data?.accessToken || headerToken;
      if (!token) {
        setServerError("Account created, but no login token was returned.");
        return;
      }
      localStorage.setItem("restaurantSlug", response.data?.slug || values.slug);
      login(
        token,
        { position: "admin", employee: values.ownerName, email: values.email, role: "admin" },
        response.data?.restaurantId
      );
      markOnboarding();
      navigate("/admin/overview");
    } catch (error) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message;
      setServerError(message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-main-bg dark:bg-main-dark-bg">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleRegister)}
          className="w-96 rounded-2xl bg-white p-8 shadow-md dark:bg-secondary-dark-bg"
        >
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-gray-100">
            Create your restaurant
          </h1>
          {serverError && (
            <p className="mb-4 rounded-md bg-red-100 px-3 py-2 text-center text-sm text-red-700" role="alert">
              {serverError}
            </p>
          )}
          {(
            [
              ["restaurantName", "Restaurant name", "text"],
              ["slug", "URL slug", "text"],
              ["ownerName", "Your name", "text"],
              ["email", "Email", "email"],
              ["password", "Password", "password"],
            ] as const
          ).map(([name, label, type]) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-gray-600 dark:text-gray-300">{label}</FormLabel>
                  <FormControl>
                    <Input
                      type={type}
                      autoComplete={name === "password" ? "new-password" : "off"}
                      className="dark:bg-main-dark-bg dark:text-gray-100"
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
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button type="submit" className="w-full bg-dark-yellow-bg text-white hover:bg-yellow-600">
            Create restaurant
          </Button>
          <p className="mt-6 text-center text-gray-600 dark:text-gray-300">
            <Link to="/" className="text-dark-yellow-bg hover:underline">
              Already have an account? Log in
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
};

export default RestaurantRegister;
