import { z } from "zod";

export const feedbackSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  role: z.string().max(80).optional(),
  rating: z
    .number()
    .int()
    .min(1, "Please select a rating")
    .max(5, "Rating cannot exceed 5"),
  category: z.enum(
    ["general", "resume", "interview", "startup-jobs", "profile-optimize"],
    { required_error: "Please select a category" }
  ),
  message: z
    .string()
    .min(10, "Feedback must be at least 10 characters")
    .max(1000, "Feedback cannot exceed 1000 characters"),
});
