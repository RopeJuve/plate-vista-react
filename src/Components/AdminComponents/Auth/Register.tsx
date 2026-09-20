import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "../../../services/api";
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
      email: values.email,
      password: values.password,
      position: values.position,
    };

    try {
      await api.post("/employee", employeeData);
      navigate("/admin/Employees");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-main-bg dark:bg-main-dark-bg">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleRegister)}
          className="bg-white dark:bg-secondary-dark-bg p-8 rounded-2xl shadow-md w-96"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 text-center">
            Add Staff
          </h2>
          {error && (
            <p className="mb-4 rounded-md bg-red-100 px-3 py-2 text-center text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel className="text-gray-600 dark:text-gray-300">Username</FormLabel>
                <FormControl>
                  <Input className="dark:bg-main-dark-bg dark:text-gray-100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel className="text-gray-600 dark:text-gray-300">Email</FormLabel>
                <FormControl>
                  <Input type="email" className="dark:bg-main-dark-bg dark:text-gray-100" {...field} />
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
                  <Input type="password" className="dark:bg-main-dark-bg dark:text-gray-100" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel className="text-gray-600 dark:text-gray-300">Position</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger className="dark:bg-main-dark-bg dark:text-gray-100">
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

          <Button
            type="submit"
            className="bg-dark-yellow-bg hover:bg-yellow-600 text-white w-full"
          >
            Register
          </Button>

          <p className="mt-6 text-gray-600 dark:text-gray-300 text-center">
            <Link to="/admin/Employees" className="text-dark-yellow-bg hover:underline">
              Back to employees
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
};

export default Register;
