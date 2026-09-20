import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  position: z.enum(["bar", "kitchen"]),
});

export type RegisterValues = z.infer<typeof registerSchema>;

const imageValue = z.union([z.instanceof(File), z.string().min(1)]);

export const menuItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  popular: z.boolean(),
  inStock: z.boolean(),
  image: imageValue.optional(),
});

export const menuItemAddSchema = menuItemSchema.extend({
  image: imageValue,
});

export type MenuItemValues = z.infer<typeof menuItemSchema>;
export type MenuItemAddValues = z.infer<typeof menuItemAddSchema>;
