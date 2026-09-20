import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";
import { consumeSessionMessage } from "../../../utils/notify";
import { loginSchema, type LoginValues } from "@/lib/schemas";
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

const Login = () => {
  const { restaurantId } = useParams();
  const [authMessage, setAuthMessage] = useState(() => consumeSessionMessage());
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const getAuthTokenFromHeaders = (headers) => {
    const authHeader =
      headers.authorization ||
      headers.Authorization ||
      (typeof headers.get === "function" ? headers.get("authorization") : "");
    if (!authHeader) {
      return null;
    }
    return authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader.split(" ")[1];
  };

  const handleLogin = async (values: LoginValues) => {
    setPending(true);
    setAuthMessage("");

    try {
      const response = await api.post(
        "/auth/employee/login",
        {
          employee: values.username,
          password: values.password,
        },
        restaurantId
          ? { headers: { "x-restaurant-id": restaurantId } }
          : undefined
      );

      if (response.status !== 200) {
        setAuthMessage("Login failed. Please try again.");
        return;
      }

      const token = getAuthTokenFromHeaders(response.headers);
      const position = response.data.position;
      login(token, { position, employee: values.username }, restaurantId);

      if (position === "admin") {
        navigate(`/admin`);
        return;
      }
      if (position === "bar" || position === "kitchen") {
        navigate(`/bar`);
        return;
      }

      logout();
      setAuthMessage("This account does not have access to the staff apps.");
    } catch (error) {
      setAuthMessage(
        error.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex items-center max-w-screen-lg mx-auto min-h-screen bg-main-bg dark:bg-main-dark-bg">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleLogin)}
          className="bg-white dark:bg-secondary-dark-bg p-8 rounded-2xl shadow-md w-96 mx-auto md:w-[50%]"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
            Login
          </h2>
          {authMessage && (
            <p className="mb-4 rounded-md bg-red-100 px-3 py-2 text-center text-sm text-red-700" role="alert">
              {authMessage}
            </p>
          )}

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel className="text-gray-600 dark:text-gray-300">Username</FormLabel>
                <FormControl>
                  <Input
                    id="employee"
                    autoComplete="username"
                    className="dark:bg-main-dark-bg dark:text-gray-100"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel className="text-gray-600 dark:text-gray-300">Password</FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    className="dark:bg-main-dark-bg dark:text-gray-100"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={pending}
            className="bg-dark-yellow-bg hover:bg-yellow-600 text-white w-full"
          >
            {pending ? "Signing in..." : "Login"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default Login;
