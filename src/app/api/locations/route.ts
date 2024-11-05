import { db } from "@/server/db";
import { type NextRequest } from "next/server";
import { LocationSchema } from "@/schemas/location";
import { type Prisma } from "@prisma/client";

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

    // Log para debug
    console.log("Received data:", body);

    const validationResult = LocationSchema.safeParse(body);

    if (!validationResult.success) {
      // Log detallado de errores de validación
      console.error("Validation errors:", validationResult.error.errors);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Datos inválidos",
          details: validationResult.error.errors.map((err) => ({
            path: err.path.join("."),
            message: err.message,
          })),
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const { latitude, longitude, googleMapsUrl, ...restData } =
      validationResult.data;

    // Asegurarse de que los números sean válidos
    const locationData: Prisma.LocationCreateInput = {
      ...restData,
      latitude: Number(latitude),
      longitude: Number(longitude),
      googleMapsUrl: googleMapsUrl || undefined,
      lastVerification: new Date(),
    };

    // Log para debug
    console.log("Processed data:", locationData);

    const location = await db.location.create({
      data: locationData,
    });

    return new Response(
      JSON.stringify({
        success: true,
        data: location,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
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
        details: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
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
