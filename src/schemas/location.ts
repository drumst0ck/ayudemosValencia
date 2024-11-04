import { z } from "zod";

export const LocationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "El nombre es requerido"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  address: z.string().min(1, "La dirección es requerida"),
  postalCode: z.string().min(1, "El código postal es requerido"),
  city: z.string().min(1, "La ciudad es requerida"),
  province: z.string().min(1, "La provincia es requerida"),
  autonomousCommunity: z.string().min(1, "La comunidad autónoma es requerida"),
  latitude: z.number(),
  longitude: z.number(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().nullable(),
  schedule: z.string().optional(),
  acceptedItems: z.array(z.string()),
  googleMapsUrl: z.string().url().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  lastVerification: z.date().optional(),
  verifiedAt: z.date().optional(),
});

export type Location = z.infer<typeof LocationSchema>;
