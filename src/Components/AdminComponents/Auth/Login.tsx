import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ownerLoginSchema, type OwnerLoginValues } from "@/lib/schemas";
import { useSignIn } from "../../../shared/auth/hooks/useSignIn";
import { staffLoginPath } from "../../../shared/auth/loginPaths";
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

// Owner login for the dashboard. Staff sign in inside their restaurant.
const Login = () => {
  const { signIn, pending, message } = useSignIn("owner");
  const form = useForm<OwnerLoginValues>({
    resolver: zodResolver(ownerLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = (values: OwnerLoginValues) =>
    signIn("/auth/owner/login", { email: values.email, password: values.password }, values.email);

  return (
    <AuthShell>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-5">
          <div>
            <h1 className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em]">Owner sign in</h1>
            <p className="mt-1 text-ink-soft">Manage your restaurant from the dashboard.</p>
          </div>
          {message && (
            <p className="rounded-md bg-alert/10 px-3 py-2 text-sm font-semibold text-alert-ink" role="alert">
              {message}
            </p>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="username" {...field} />
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
          <div className="space-y-2 text-center text-sm text-ink-soft">
            <p>
              Work at a restaurant?{" "}
              <Link to={staffLoginPath()} className="font-semibold text-ink underline decoration-signal decoration-2 hover:text-signal-ink">
                Staff sign in
              </Link>
            </p>
            <p>
              New to Plate Vista?{" "}
              <Link to="/register" className="font-semibold text-ink underline decoration-signal decoration-2 hover:text-signal-ink">
                Create a restaurant
              </Link>
            </p>
          </div>
        </form>
      </Form>
    </AuthShell>
  );
};

export default Login;
