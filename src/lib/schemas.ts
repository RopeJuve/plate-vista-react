import { z } from "zod";

export const ownerLoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type OwnerLoginValues = z.infer<typeof ownerLoginSchema>;

export const staffLoginSchema = z.object({
  restaurant: z.string().trim().min(1, "Restaurant is required"),
  username: z.string().trim().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type StaffLoginValues = z.infer<typeof staffLoginSchema>;

export const registerSchema = z.object({
  username: z.string().min(1, "Username is required"),
  // Contact info only; staff sign in with restaurant + username.
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email")]),
  password: z.string().min(6, "Password must be at least 6 characters"),
  position: z.enum(["bar", "kitchen"]),
});

export type RegisterValues = z.infer<typeof registerSchema>;

export const restaurantRegisterSchema = z.object({
  restaurantName: z.string().min(1, "Restaurant name is required"),
  slug: z
    .string()
    .min(2, "Slug is too short")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  employee: z.string().min(1, "Owner name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RestaurantRegisterValues = z.infer<typeof restaurantRegisterSchema>;

const imageValue = z.union([z.instanceof(File), z.string().min(1)]);

export const menuItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  price: z.number().positive("Price must be greater than 0"),
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
