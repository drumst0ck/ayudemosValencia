"use client";

import { useState, useEffect } from "react";
import { type Location } from "@/schemas/location";
import { type Community, type Province, type Town } from "@/types/locations";
import territoriesData from "@/arbol.json";

type FormData = Omit<
  Location,
  "id" | "createdAt" | "updatedAt" | "lastVerification" | "verifiedAt"
>;

const ACCEPTED_ITEMS = {
  FOOD: "Alimentos",
  CLOTHING: "Ropa",
  HYGIENE: "Productos de Higiene",
  CLEANING: "Productos de Limpieza",
  MEDICINE: "Medicamentos",
  TOOLS: "Herramientas",
  OTHER: "Otros",
} as const;

function extractCoordinatesFromGoogleMapsUrl(
  url: string,
): { latitude: number; longitude: number } | null {
  try {
    // Intentar extraer coordenadas de diferentes formatos de URL de Google Maps

    // Formato: https://www.google.com/maps?q=40.4167,-3.7037
    const searchParams = new URL(url).searchParams;
    const coords = searchParams.get("q")?.split(",");
    if (coords?.length === 2) {
      return {
        latitude: parseFloat(coords[0] ?? ""),
        longitude: parseFloat(coords[1] ?? ""),
      };
    }

    // Formato: https://www.google.com/maps/@40.4167,-3.7037,15z
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) {
      return {
        latitude: parseFloat(match[1] ?? ""),
        longitude: parseFloat(match[2] ?? ""),
      };
    }

    // Formato: https://goo.gl/maps/xxx
    // Para este formato necesitaríamos hacer una petición al servidor
    // y seguir la redirección para obtener las coordenadas

    return null;
  } catch (error) {
    console.error("Error al extraer coordenadas:", error);
    return null;
  }
}

export function LocationForm() {
  const [communities] = useState<Community[]>(territoriesData as Community[]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [towns, setTowns] = useState<Town[]>([]);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    isActive: true,
    address: "",
    postalCode: "",
    city: "",
    province: "",
    autonomousCommunity: "",
    latitude: 0,
    longitude: 0,
    phone: "",
    email: "",
    website: "",
    schedule: "",
    acceptedItems: [],
    googleMapsUrl: "",
  });

  const [googleMapsUrl, setGoogleMapsUrl] = useState("");

  const handleGoogleMapsUrlChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const url = e.target.value;
    setGoogleMapsUrl(url);

    // Resetear las coordenadas si el campo está vacío
    if (!url) {
      setFormData((prev) => ({
        ...prev,
        googleMapsUrl: "",
        latitude: 0,
        longitude: 0,
      }));
      return;
    }

    // Intentar extraer las coordenadas
    const coordinates = extractCoordinatesFromGoogleMapsUrl(url);

    // Actualizar el formulario con las nuevas coordenadas o resetear si no se pudieron extraer
    setFormData((prev) => ({
      ...prev,
      googleMapsUrl: url,
      latitude: coordinates?.latitude ?? 0,
      longitude: coordinates?.longitude ?? 0,
    }));

    // Opcionalmente, mostrar un mensaje si no se pudieron extraer las coordenadas
    if (!coordinates) {
      alert("No se pudieron extraer las coordenadas de la URL proporcionada");
    }
  };

  // Efecto para actualizar provincias cuando cambia la comunidad
  useEffect(() => {
    if (selectedCommunity) {
      const community = communities.find((c) => c.label === selectedCommunity);
      if (community) {
        setProvinces(community.provinces);
        setSelectedProvince("");
        setTowns([]);
        setFormData((prev) => ({
          ...prev,
          autonomousCommunity: selectedCommunity,
          province: "",
          city: "",
        }));
      }
    } else {
      setProvinces([]);
      setSelectedProvince("");
      setTowns([]);
    }
  }, [selectedCommunity, communities]);

  // Efecto para actualizar ciudades cuando cambia la provincia
  useEffect(() => {
    if (selectedProvince) {
      const province = provinces.find((p) => p.label === selectedProvince);
      if (province) {
        setTowns(province.towns);
        setFormData((prev) => ({
          ...prev,
          province: selectedProvince,
          city: "",
        }));
      }
    } else {
      setTowns([]);
    }
  }, [selectedProvince, provinces]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Error de localización cercana existente
          const confirmCreate = window.confirm(
            "Ya existe un punto de recogida cercano a estas coordenadas. ¿Deseas crear uno nuevo de todas formas?",
          );

          if (!confirmCreate) {
            return;
          }

          // Si el usuario confirma, hacer otra petición forzando la creación
          const forceResponse = await fetch("/api/locations?force=true", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          });

          if (!forceResponse.ok) {
            throw new Error("Error al guardar la localización");
          }
        } else {
          throw new Error(data.error || "Error al guardar la localización");
        }
      }

      // Resetear formulario
      setFormData({
        name: "",
        description: "",
        isActive: true,
        address: "",
        postalCode: "",
        city: "",
        province: "",
        autonomousCommunity: "",
        latitude: 0,
        longitude: 0,
        phone: "",
        email: "",
        website: "",
        schedule: "",
        acceptedItems: [],
        googleMapsUrl: "",
      });

      alert("Localización guardada correctamente");
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al guardar la localización",
      );
    }
  };

  const handleToggleItem = (item: string) => {
    setFormData((prev) => {
      const items = prev.acceptedItems.includes(item)
        ? prev.acceptedItems.filter((i) => i !== item)
        : [...prev.acceptedItems, item];
      return { ...prev, acceptedItems: items };
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Información Básica</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Nombre del punto"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="rounded border p-2"
            required
          />
          <textarea
            placeholder="Descripción"
            value={formData.description ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="rounded border p-2"
            required
          />
        </div>
      </div>

      {/* Selectores de ubicación */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Ubicación</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <select
            value={selectedCommunity}
            onChange={(e) => setSelectedCommunity(e.target.value)}
            className="rounded border p-2"
            required
          >
            <option value="">Selecciona Comunidad Autónoma</option>
            {communities.map((community) => (
              <option key={community.label} value={community.label}>
                {community.label}
              </option>
            ))}
          </select>

          <select
            value={selectedProvince}
            onChange={(e) => setSelectedProvince(e.target.value)}
            className="rounded border p-2"
            required
            disabled={!selectedCommunity}
          >
            <option value="">Selecciona Provincia</option>
            {provinces.map((province) => (
              <option key={province.label} value={province.label}>
                {province.label}
              </option>
            ))}
          </select>

          <select
            value={formData.city}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, city: e.target.value }))
            }
            className="rounded border p-2"
            required
            disabled={!selectedProvince}
          >
            <option value="">Selecciona Municipio</option>
            {towns.map((town) => (
              <option key={town.label} value={town.label}>
                {town.label}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Dirección"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="rounded border p-2"
            required
          />

          <input
            type="text"
            placeholder="Código Postal"
            value={formData.postalCode}
            onChange={(e) =>
              setFormData({ ...formData, postalCode: e.target.value })
            }
            className="rounded border p-2"
            required
          />
        </div>
      </div>

      {/* Coordenadas y Google Maps */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Ubicación en el Mapa</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="col-span-full">
            <input
              type="url"
              placeholder="URL de Google Maps"
              value={googleMapsUrl}
              onChange={handleGoogleMapsUrlChange}
              className="w-full rounded border p-2"
            />
            <p className="mt-1 text-sm text-gray-500">
              Pega la URL de Google Maps para obtener las coordenadas
              automáticamente
            </p>
          </div>

          <input
            type="number"
            step="any"
            placeholder="Latitud"
            value={formData.latitude}
            onChange={(e) =>
              setFormData({
                ...formData,
                latitude: parseFloat(e.target.value),
              })
            }
            className="rounded border p-2"
            required
          />
          <input
            type="number"
            step="any"
            placeholder="Longitud"
            value={formData.longitude}
            onChange={(e) =>
              setFormData({
                ...formData,
                longitude: parseFloat(e.target.value),
              })
            }
            className="rounded border p-2"
            required
          />
        </div>
      </div>

      {/* Información de contacto */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Información de Contacto</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            type="tel"
            placeholder="Teléfono"
            value={formData.phone ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            className="rounded border p-2"
          />
          <input
            type="email"
            placeholder="Email"
            value={formData.email ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            className="rounded border p-2"
          />
          <input
            type="url"
            placeholder="Sitio Web"
            value={formData.website ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, website: e.target.value })
            }
            className="rounded border p-2"
          />
        </div>
      </div>

      {/* Items Aceptados */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Items Aceptados</h3>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Object.entries(ACCEPTED_ITEMS).map(([value, label]) => (
            <label
              key={value}
              className="flex cursor-pointer items-center space-x-2 rounded border p-3 hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={formData.acceptedItems.includes(value)}
                onChange={() => handleToggleItem(value)}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
      >
        Guardar Localización
      </button>
    </form>
  );
}
