import { z } from "zod";

export const LocationSchema = z.object({
  id: z.string().nullable(),
  name: z.string(),
  description: z.string().nullable(),
  address: z.string(),
  postalCode: z.string(),
  city: z.string(),
  province: z.string(),
  autonomousCommunity: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  googleMapsUrl: z.string().nullable(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  schedule: z.string().nullable(),
  acceptedItems: z.array(z.string()),
  isActive: z.boolean().default(true),
});

export type Location = z.infer<typeof LocationSchema>;
