import { db } from "@/server/db";
import { type NextRequest } from "next/server";
import { LocationSchema } from "@/schemas/location";
import { type Prisma } from "@prisma/client";
export const runtime = "edge";
// Constante para el radio de búsqueda en grados (aproximadamente 100 metros)
const SEARCH_RADIUS = 0.001;

export async function POST(req: NextRequest) {
  try {
    if (!req.body) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "No se recibieron datos",
        }),
        { status: 400 },
      );
    }

    const body = await req.json();
    const validationResult = LocationSchema.safeParse(body);
    const forceCreate = req.nextUrl.searchParams.get("force") === "true";

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Datos inválidos",
          details: validationResult.error.errors,
        }),
        { status: 400 },
      );
    }

    const { latitude, longitude, googleMapsUrl, ...restData } =
      validationResult.data;

    // Solo verificar puntos cercanos si no se está forzando la creación
    if (!forceCreate) {
      const nearbyLocation = await db.location.findFirst({
        where: {
          AND: [
            { latitude: { gte: latitude - SEARCH_RADIUS } },
            { latitude: { lte: latitude + SEARCH_RADIUS } },
            { longitude: { gte: longitude - SEARCH_RADIUS } },
            { longitude: { lte: longitude + SEARCH_RADIUS } },
          ],
        },
      });

      if (nearbyLocation) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Ya existe un punto de recogida cercano a estas coordenadas",
            nearbyLocation,
          }),
          { status: 409 },
        );
      }
    }

    const locationData: Prisma.LocationCreateInput = {
      ...restData,
      latitude,
      longitude,
      googleMapsUrl,
      lastVerification: new Date(),
    };

    const location = await db.location.create({
      data: locationData,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: location,
      }),
      { status: 200 },
    );
  } catch (error) {
    console.error("Error creating location:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Error al crear la localización",
      }),
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;

    // Construir el objeto de filtros
    const filters: Prisma.LocationWhereInput = {
      isActive: true,
    };

    // Aplicar filtros solo si tienen un valor no vacío
    const autonomousCommunity = searchParams.get("autonomousCommunity");
    if (autonomousCommunity) {
      filters.autonomousCommunity = autonomousCommunity;
    }

    const province = searchParams.get("province");
    if (province) {
      filters.province = province;
    }

    const city = searchParams.get("city");
    if (city) {
      filters.city = city;
    }

    const acceptedItems = searchParams.get("acceptedItems")?.split(",");
    if (acceptedItems?.length) {
      filters.acceptedItems = {
        hasSome: acceptedItems,
      };
    }

    const locations = await db.location.findMany({
      where: filters,
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json({ locations });
  } catch (error) {
    console.error("Error fetching locations:", error);
    return Response.json(
      { error: "Error al obtener las localizaciones" },
      { status: 500 },
    );
  }
}
