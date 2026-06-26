import { z } from "zod";

export const leadSchema = z.object({
  client_name: z.string().trim().min(1, "Name is required"),
  company_name: z.string().trim().min(1, "Company is required"),
  phone: z.string().trim().min(5, "Phone is required"),
  email: z.string().trim().email("Valid email required"),
  service_requested: z.string().trim().min(1, "Service is required"),
  source_page: z.string().trim().min(1, "Source page is required"),
});

export type LeadInput = z.infer<typeof leadSchema>;
