import { z } from "zod";

export const lineItemSchema = z.object({
  description: z.string().trim().min(1, "Description is required"),
  quantity: z.number().min(0),
  unit_price: z.number().min(0),
  total: z.number().min(0),
});

export const documentSchema = z.object({
  client_id: z.string().uuid("Client is required"),
  type: z.enum(["quotation", "proposal", "invoice"]),
  status: z.enum(["draft", "sent", "accepted", "paid"]).default("draft"),
  line_items: z.array(lineItemSchema).min(1, "At least one line item is required"),
  terms: z.string().trim().default(""),
  notes: z.string().trim().default(""),
  valid_until: z.string().nullable().optional(),
  parent_document_id: z.string().uuid().nullable().optional(),
});

export type DocumentInput = z.infer<typeof documentSchema>;
