"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { LocationFilters } from "@/components/LocationFilters";
import { type LocationFilters as LocationFiltersType } from "@/types/locations";
import { type Location } from "@/schemas/location";

const LocationMap = dynamic(() => import("@/components/LocationMap"), {
  ssr: false,
});

export default function HomePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filters, setFilters] = useState<LocationFiltersType>({});

  const fetchLocations = useCallback(async (filters: LocationFiltersType) => {
    try {
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

      const response = await fetch(`/api/locations?${searchParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al obtener las localizaciones");
      }

      setLocations(data.locations);
    } catch (error) {
      console.error("Error al filtrar localizaciones:", error);
    }
  }, []);

  useEffect(() => {
    void fetchLocations({});
  }, [fetchLocations]);

  const handleFiltersChange = useCallback((newFilters: LocationFiltersType) => {
    setFilters(newFilters);
    void fetchLocations(newFilters);
  }, [fetchLocations]);

  return (
    <main className="flex min-h-screen">
      <div className="w-80 border-r bg-gray-50 p-4">
        <LocationFilters onFiltersChange={handleFiltersChange} />
      </div>
      <div className="flex-1">
        <Suspense fallback={<div>Cargando mapa...</div>}>
          <LocationMap locations={locations} />
        </Suspense>
      </div>
    </main>
  );
}
