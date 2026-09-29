import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../../contexts/AuthContext";
import api from "../../../services/api";
import { apiMessage, consumeSessionMessage } from "../../../utils/notify";
import { readTokenFromHeaders, readRestaurantIdFromUnknown } from "../../../shared/api/jwt";
import type { TokenBody } from "../../../shared/api/tokens";
import { loginSchema, type LoginValues } from "@/lib/schemas";
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

const Login = () => {
  const [authMessage, setAuthMessage] = useState(() => consumeSessionMessage());
  const [pending, setPending] = useState(false);
  const navigate = useNavigate();
  const { login, logout } = useAuth();
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const handleLogin = async (values: LoginValues) => {
    setPending(true);
    setAuthMessage("");

    try {
      const storedRestaurantId = localStorage.getItem("restaurantId");
      const response = await api.post(
        "/auth/employee/login",
        {
          employee: values.username,
          password: values.password,
        },
        storedRestaurantId
          ? { headers: { "x-restaurant-id": storedRestaurantId } }
          : undefined
      );

      if (response.status !== 200) {
        setAuthMessage("Login failed. Please try again.");
        return;
      }

      const data = response.data as TokenBody & {
        position?: string;
        restaurantId?: unknown;
      };
      const position = data.position;
      const restaurantId = readRestaurantIdFromUnknown(data) ?? undefined;
      const loggedIn = login(
        data,
        { position, employee: values.username },
        restaurantId,
        readTokenFromHeaders(response.headers)
      );
      if (!loggedIn) {
        setAuthMessage("Login failed. Please try again.");
        return;
      }

      if (position === "admin" || position === "owner") {
        navigate(`/admin`);
        return;
      }
      if (position === "bar" || position === "kitchen") {
        navigate(`/bar`);
        return;
      }

      logout();
      setAuthMessage("This account does not have access to the staff apps.");
    } catch (error: unknown) {
      setAuthMessage(apiMessage(error, "Login failed. Please try again."));
    } finally {
      setPending(false);
    }
  };

  return (
    <AuthShell>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-5">
          <div>
            <h1 className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em]">Sign in</h1>
            <p className="mt-1 text-ink-soft">Staff and owners use the same login. We’ll take you to the board or the admin.</p>
          </div>
          {authMessage && (
            <p className="rounded-md bg-alert/10 px-3 py-2 text-sm font-semibold text-alert-ink" role="alert">
              {authMessage}
            </p>
          )}

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input id="employee" autoComplete="username" {...field} />
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
                  <Input id="password" type="password" autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" size="lg" disabled={pending} className="w-full">
            {pending ? "Signing in…" : "Login"}
          </Button>
          <p className="text-center text-sm text-ink-soft">
            New to Plate Vista?{" "}
            <Link to="/register" className="font-semibold text-ink underline decoration-signal decoration-2 hover:text-signal-ink">
              Create a restaurant
            </Link>
          </p>
        </form>
      </Form>
    </AuthShell>
  );
};

export default Login;
