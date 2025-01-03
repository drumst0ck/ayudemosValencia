"use client";

import { Suspense, useState, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { LocationFilters } from "@/components/LocationFilters";
import { type LocationFilters as LocationFiltersType } from "@/types/locations";
import { type Location } from "@/schemas/location";
import { WelcomePopup } from "@/components/WelcomePopup";

const LocationMap = dynamic(() => import("@/components/LocationMap"), {
  ssr: false,
});

export default function HomePage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filters, setFilters] = useState<LocationFiltersType>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const handleFiltersChange = useCallback(
    (newFilters: LocationFiltersType) => {
      setFilters(newFilters);
      void fetchLocations(newFilters);
    },
    [fetchLocations],
  );

  return (
    <main className="relative flex h-[100dvh] flex-col md:flex-row">
      <WelcomePopup />

      {/* Reemplazamos el botón de hamburguesa por un botón que dice MENU */}
      <button
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="fixed left-4 top-4 z-[1000] rounded-lg bg-white px-4 py-2 shadow-lg md:hidden font-medium text-gray-700"
        aria-label="Abrir filtros"
      >
        MENU
      </button>

      {/* Panel de filtros - Ajustado para manejar scroll interno */}
      <div
        className={`fixed inset-y-0 left-0 z-[1001] w-80 transform overflow-hidden bg-white shadow-lg transition-transform duration-300 ease-in-out md:relative md:transform-none md:border-r md:shadow-none ${
          isFilterOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Título y botón cerrar */}
        <div className="mb-1 flex items-center w-full justify-end md:hidden">
          <button
            onClick={() => setIsFilterOpen(false)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar filtros"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <LocationFilters
          onFiltersChange={handleFiltersChange}
          onFilterApplied={() => setIsFilterOpen(false)}
        />
      </div>

      {/* Overlay - Ajustado z-index */}
      {isFilterOpen && (
        <div
          className="fixed inset-0 z-[999] bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsFilterOpen(false)}
        />
      )}

      {/* Mapa - Ajustado para ocupar el espacio restante */}
      <div className="flex-1">
        <Suspense fallback={<div>Cargando mapa...</div>}>
          <LocationMap locations={locations} />
        </Suspense>
      </div>
    </main>
  );
}
