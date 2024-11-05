"use client";

import { useState, useEffect } from "react";
import { type Community, type LocationFilters } from "@/types/locations";
import territoriesData from "@/arbol.json";
import { ACCEPTED_ITEMS } from "@/constants/items";
import {
  MapPin,
  Building2,
  Building,
  Package,
  Languages,
  Globe2,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { locales } from "@/i18n";
import Link from "next/link";

// Función para generar IDs únicos
const generateUniqueId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

type LocationFiltersProps = {
  onFiltersChange: (filters: LocationFilters) => void;
  onFilterApplied?: () => void;
};

export function LocationFilters({
  onFiltersChange,
  onFilterApplied,
}: LocationFiltersProps) {
  const [communities] = useState<Community[]>(territoriesData as Community[]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [provinces, setProvinces] = useState([] as Community["provinces"]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [towns, setTowns] = useState(
    [] as Community["provinces"][number]["towns"],
  );
  const [selectedTown, setSelectedTown] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

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

  const handleLanguageChange = (newLocale: string) => {
    const currentPath = pathname.split("/").slice(2).join("/");
    router.push(`/${newLocale}/${currentPath}`);
  };

  return (
    <div className="flex h-[100dvh] flex-col md:h-full">
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-6 p-6">
          {/* Banner de Emergencia */}
          <div className="rounded-lg bg-red-600 p-4 text-white shadow-lg">
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="font-medium">{t("emergency.title")}</p>
              <a
                href="tel:900365112"
                className="text-xl font-bold hover:underline"
              >
                {t("emergency.phone")}
              </a>
            </div>
          </div>

          {/* Selector de idioma */}
          <div className="flex items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2">
              <Globe2 className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Idioma</span>
            </div>
            <div className="flex gap-2">
              {[
                { code: "es", label: "ES" },
                { code: "ca", label: "VA" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    pathname.split("/")[1] === lang.code
                      ? "bg-teal-100 text-teal-700"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                  aria-label={`Cambiar a ${lang.code === "es" ? "Español" : "Valencià"}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nuevo botón de añadir localización */}
          <div className="rounded-lg border border-teal-100 bg-teal-50 p-4">
            <div className="mb-3 flex items-start gap-3">
              <div className="rounded-full bg-teal-100 p-2">
                <Plus className="h-5 w-5 text-teal-600" />
              </div>
              <div>
                <h4 className="font-medium text-teal-900">
                  {t("filters.addLocation.title") ??
                    "¿Conoces un punto de recogida?"}
                </h4>
                <p className="mt-1 text-sm text-teal-700">
                  {t("filters.addLocation.description") ??
                    "Ayuda a la comunidad añadiendo nuevos puntos de recogida. Por favor, verifica la información antes de publicarla."}
                </p>
              </div>
            </div>
            <Link
              href="/admin"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" />
              {t("filters.addLocation.button") ?? "Añadir punto de recogida"}
            </Link>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">
              {t("filters.title")}
            </h3>

            <div className="space-y-4">
              {/* Comunidad Autónoma */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Building2 className="h-4 w-4" />
                  {t("filters.location.community")}
                </label>
                <select
                  value={selectedCommunity}
                  onChange={(e) => handleCommunityChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white p-2.5 shadow-sm transition hover:border-teal-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <option value="">{t("filters.location.all")}</option>
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
                  {t("filters.location.province")}
                </label>
                <select
                  value={selectedProvince}
                  onChange={(e) => handleProvinceChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white p-2.5 shadow-sm transition hover:border-teal-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-gray-100 disabled:opacity-50"
                  disabled={!selectedCommunity}
                >
                  <option value="">{t("filters.location.all")}</option>
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
                  {t("filters.location.city")}
                </label>
                <select
                  value={selectedTown}
                  onChange={(e) => handleTownChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white p-2.5 shadow-sm transition hover:border-teal-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:bg-gray-100 disabled:opacity-50"
                  disabled={!selectedProvince}
                >
                  <option value="">{t("filters.location.all")}</option>
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
                  {t("filters.location.acceptedItems")}
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
      </div>

      <div className="border-t border-gray-200 p-4">
        <a
          href="https://github.com/drumst0ck/ayudemosValencia"
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
          {t("common.openSource")}
        </a>
      </div>
    </div>
  );
}
