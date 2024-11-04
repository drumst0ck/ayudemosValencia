"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { LocationFilters } from "@/components/LocationFilters";
import { type LocationFilters as LocationFiltersType } from "@/types/locations";
import { type Location } from "@/schemas/location";

// Cargar LocationMap dinámicamente para evitar el error de "window is not defined"
const LocationMap = dynamic(() => import("@/components/LocationMap"), {
  ssr: false, // Desactivar el renderizado en el servidor
});

export default function HomePage() {
  const [locations, setLocations] = useState<Location[]>([]);

  const handleFiltersChange = async (filters: LocationFiltersType) => {
    try {
      // Construir la URL con los filtros
      const searchParams = new URLSearchParams();

      if (filters.autonomousCommunity) {
        searchParams.set("autonomousCommunity", filters.autonomousCommunity);
      }

      if (filters.province) {
        searchParams.set("province", filters.province);
      }

      if (filters.city) {
        searchParams.set("city", filters.city);
      }

      if (filters.acceptedItems?.length) {
        searchParams.set("acceptedItems", filters.acceptedItems.join(","));
      }

      // Hacer la petición a la API
      const response = await fetch(`/api/locations?${searchParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al obtener las localizaciones");
      }

      setLocations(data.locations);
    } catch (error) {
      console.error("Error al filtrar localizaciones:", error);
      // Aquí podrías mostrar un mensaje de error al usuario
    }
  };

  return (
    <main className="flex min-h-screen">
      {/* Panel lateral de filtros */}
      <div className="w-80 border-r bg-gray-50 p-4">
        <LocationFilters onFiltersChange={handleFiltersChange} />
      </div>

      {/* Mapa */}
      <div className="flex-1">
        <Suspense fallback={<div>Cargando mapa...</div>}>
          <LocationMap locations={locations} />
        </Suspense>
      </div>
    </main>
  );
}
