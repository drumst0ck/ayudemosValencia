"use client";

import { useState, useEffect } from "react";
import { type Community, type LocationFilters } from "@/types/locations";
import territoriesData from "@/arbol.json";
import { ACCEPTED_ITEMS } from "@/constants/items";

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange(filters);
    onFilterApplied?.();
  };

  return (
    <div className="space-y-4 rounded-lg bg-white p-4 shadow">
      <h3 className="text-lg font-semibold">Filtros</h3>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Comunidad Autónoma
        </label>
        <select
          value={selectedCommunity}
          onChange={(e) => handleCommunityChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2"
        >
          <option value="">Todas</option>
          {communities.map((community) => (
            <option key={generateUniqueId()} value={community.label}>
              {community.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Provincia</label>
        <select
          value={selectedProvince}
          onChange={(e) => handleProvinceChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2"
          disabled={!selectedCommunity}
        >
          <option value="">Todas</option>
          {provinces.map((province) => (
            <option key={generateUniqueId()} value={province.label}>
              {province.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Municipio</label>
        <select
          value={selectedTown}
          onChange={(e) => handleTownChange(e.target.value)}
          className="w-full rounded-lg border border-gray-300 p-2"
          disabled={!selectedProvince}
        >
          <option value="">Todos</option>
          {towns.map((town) => (
            <option key={generateUniqueId()} value={town.label}>
              {town.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Items Aceptados
        </label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(ACCEPTED_ITEMS).map(([value, label]) => (
            <label
              key={generateUniqueId()}
              className="flex items-center space-x-2 text-sm"
            >
              <input
                type="checkbox"
                checked={selectedItems.includes(value)}
                onChange={() => handleItemToggle(value)}
                className="rounded border-gray-300"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
