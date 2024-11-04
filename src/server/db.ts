import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { env } from "@/env";

// En Edge Runtime no necesitamos caché global ya que no hay estado compartido
const db = new PrismaClient({
  log: env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  // Necesario para Cloudflare Edge
  datasourceUrl: env.DATABASE_URL,
}).$extends(withAccelerate());

export { db };
