import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../services/api";
import Header from "../Header";
import { apiMessage } from "../../../utils/notify";
import { registerSchema, type RegisterValues } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const Register = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      position: "bar",
    },
  });

  const handleRegister = async (values: RegisterValues) => {
    setError("");
    const employeeData = {
      employee: values.username,
      email: values.email || undefined,
      password: values.password,
      position: values.position,
    };

    try {
      // 403s carry a readable reason (rank rules); show it here, not as a toast.
      await api.post("/employee", employeeData, { skipErrorToast: true });
      navigate("/admin/employees");
    } catch (err: unknown) {
      setError(apiMessage(err, "Registration failed. Please try again."));
    }
  };

  return (
    <div>
      <Header title="Add Staff" description="Bar and kitchen staff sign in to the order board with these details." />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleRegister)}
          className="max-w-lg space-y-5 rounded-xl bg-white p-5 ring-1 ring-ink/[0.07] md:p-6"
        >
          {error && (
            <p className="rounded-md bg-alert/10 px-3 py-2 text-sm font-semibold text-alert-ink" role="alert">
              {error}
            </p>
          )}

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input autoComplete="off" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (optional)</FormLabel>
                <FormControl>
                  <Input type="email" autoComplete="off" {...field} />
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
                  <Input type="password" autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Position</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a position" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="bar">Bar</SelectItem>
                    <SelectItem value="kitchen">Kitchen</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap items-center gap-4 pt-1">
            <Button type="submit" size="lg">
              Register
            </Button>
            <Link to="/admin/employees" className="text-sm font-semibold text-ink-soft hover:text-ink">
              Back to employees
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Register;
