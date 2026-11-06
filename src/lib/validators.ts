import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number")
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password is too long")
    .regex(/[A-Za-z]/, "Password needs at least one letter")
    .regex(/[0-9]/, "Password needs at least one number"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

const lessonSchema = z.object({
  _id: z.string().optional(),
  title: z.string().trim().min(1, "Lesson title is required").max(160),
  durationMin: z.coerce.number().int().min(0).max(600).default(10),
  videoUrl: z.string().trim().max(500).optional().default(""),
  notes: z.string().trim().max(5000).optional().default(""),
});

const moduleSchema = z.object({
  _id: z.string().optional(),
  title: z.string().trim().min(1, "Module title is required").max(160),
  lessons: z.array(lessonSchema).max(60),
});

export const courseSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(140),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug can only contain lowercase letters, numbers and hyphens")
    .max(100),
  shortDescription: z.string().trim().min(10, "Short description is too short").max(220),
  description: z.string().trim().min(20, "Description is too short").max(6000),
  category: z.string().trim().min(2).max(60),
  level: z.enum(["Beginner", "Intermediate", "Advanced"]),
  durationWeeks: z.coerce.number().int().min(1).max(104),
  instructor: z.string().trim().min(2).max(80),
  price: z.coerce.number().min(0).max(1000000),
  originalPrice: z.coerce.number().min(0).max(1000000).default(0),
  features: z.array(z.string().trim().min(1).max(160)).max(12).default([]),
  modules: z.array(moduleSchema).max(40).default([]),
  published: z.boolean().default(true),
});

export const progressSchema = z.object({
  lessonId: z.string().min(1),
  completed: z.boolean(),
});

export const createOrderSchema = z.object({
  courseId: z.string().min(1),
});

export const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export type CourseInput = z.infer<typeof courseSchema>;
