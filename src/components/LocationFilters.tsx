"use client";

import { useState, useEffect } from "react";
import { type Community, type LocationFilters } from "@/types/locations";
import territoriesData from "@/arbol.json";
import { ACCEPTED_ITEMS } from "@/constants/items";
import { MapPin, Building2, Building, Package } from "lucide-react";

// Función para generar IDs únicos
const generateUniqueId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

type LocationFiltersProps = {
  onFiltersChange: (filters: LocationFilters) => void;
  onFilterApplied?: () => void;
};

export function LocationFilters({ onFiltersChange, onFilterApplied }: LocationFiltersProps) {
  const [communities] = useState<Community[]>(territoriesData as Community[]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [provinces, setProvinces] = useState([] as Community["provinces"]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [towns, setTowns] = useState(
    [] as Community["provinces"][number]["towns"],
  );
  const [selectedTown, setSelectedTown] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Cargar localizaciones iniciales
  useEffect(() => {
    void onFiltersChange({});
  }, [onFiltersChange]);

  // Efecto para actualizar provincias cuando cambia la comunidad
  useEffect(() => {
    if (selectedCommunity) {
      const community = communities.find((c) => c.label === selectedCommunity);
      if (community) {
        setProvinces(community.provinces);
        setSelectedProvince("");
        setSelectedTown("");
      }
    } else {
      setProvinces([]);
      setSelectedProvince("");
      setSelectedTown("");
    }
  }, [selectedCommunity, communities]);

  // Efecto para actualizar ciudades cuando cambia la provincia
  useEffect(() => {
    if (selectedProvince) {
      const province = provinces.find((p) => p.label === selectedProvince);
      if (province) {
        setTowns(province.towns);
        setSelectedTown("");
      }
    } else {
      setTowns([]);
      setSelectedTown("");
    }
  }, [selectedProvince, provinces]);

  const handleCommunityChange = (community: string) => {
    setSelectedCommunity(community);
    onFiltersChange({
      autonomousCommunity: community || undefined,
      province: undefined,
      city: undefined,
      acceptedItems: selectedItems,
    });
  };

  const handleProvinceChange = (province: string) => {
    setSelectedProvince(province);
    onFiltersChange({
      autonomousCommunity: selectedCommunity,
      province: province || undefined,
      city: undefined,
      acceptedItems: selectedItems,
    });
  };

  const handleTownChange = (town: string) => {
    setSelectedTown(town);
    onFiltersChange({
      autonomousCommunity: selectedCommunity,
      province: selectedProvince,
      city: town || undefined,
      acceptedItems: selectedItems,
    });
  };

  const handleItemToggle = (item: string) => {
    const newItems = selectedItems.includes(item)
      ? selectedItems.filter((i) => i !== item)
      : [...selectedItems, item];

    setSelectedItems(newItems);
    onFiltersChange({
      autonomousCommunity: selectedCommunity,
      province: selectedProvince,
      city: selectedTown,
      acceptedItems: newItems,
    });
  };


  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-6">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800">Filtros</h3>
          
          <div className="space-y-4">
            {/* Comunidad Autónoma */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building2 className="h-4 w-4" />
                Comunidad Autónoma
              </label>
              <select
                value={selectedCommunity}
                onChange={(e) => handleCommunityChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 shadow-sm transition hover:border-teal-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              >
                <option value="">Todas</option>
                {communities.map((community) => (
                  <option key={community.code} value={community.label}>
                    {community.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Provincia */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Building className="h-4 w-4" />
                Provincia
              </label>
              <select
                value={selectedProvince}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 shadow-sm transition hover:border-teal-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-gray-100 disabled:opacity-50"
                disabled={!selectedCommunity}
              >
                <option value="">Todas</option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.label}>
                    {province.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Municipio */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MapPin className="h-4 w-4" />
                Municipio
              </label>
              <select
                value={selectedTown}
                onChange={(e) => handleTownChange(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white p-2.5 shadow-sm transition hover:border-teal-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-gray-100 disabled:opacity-50"
                disabled={!selectedProvince}
              >
                <option value="">Todos</option>
                {towns.map((town) => (
                  <option key={town.code} value={town.label}>
                    {town.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Items Aceptados */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Package className="h-4 w-4" />
                Items Aceptados
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(ACCEPTED_ITEMS).map(([value, label]) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 rounded-lg border border-gray-200 p-2 text-sm transition hover:border-teal-500 hover:bg-teal-50"
                  >
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(value)}
                      onChange={() => handleItemToggle(value)}
                      className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                    />
                    <span className="text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con enlace al repositorio */}
      <div className="mt-6 border-t border-gray-200 pt-4">
        <a
          href="https://github.com/tu-usuario/tu-repo"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm text-gray-600 transition hover:text-teal-600"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
          </svg>
          Proyecto Open Source
        </a>
      </div>
    </div>
  );
}
