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

const FORM_STEPS = [
  {
    id: "basic",
    title: "Información Básica",
    description: "Nombre y descripción del punto de recogida",
  },
  {
    id: "location",
    title: "Ubicación",
    description: "Dirección y coordenadas del punto",
  },
  {
    id: "contact",
    title: "Contacto",
    description: "Información de contacto",
  },
  {
    id: "items",
    title: "Items Aceptados",
    description: "Tipos de items que se aceptan",
  },
] as const;

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

  const [currentStep, setCurrentStep] = useState(0);

  // Función para navegar entre pasos
  const nextStep = () => {
    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

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

  // Modificar la función handleSubmit y agregar una nueva función para el siguiente paso
  const handleNextStep = () => {
    // Validaciones por paso
    if (currentStep === 0) {
      if (!formData.name || !formData.description) {
        alert("Por favor completa todos los campos obligatorios");
        return;
      }
    } else if (currentStep === 1) {
      if (
        !formData.address ||
        !formData.postalCode ||
        !formData.city ||
        !formData.province ||
        !formData.autonomousCommunity ||
        !formData.latitude ||
        !formData.longitude
      ) {
        alert("Por favor completa todos los campos obligatorios");
        return;
      }
    }

    nextStep();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Si no estamos en el último paso, solo avanzamos
    if (currentStep < FORM_STEPS.length - 1) {
      handleNextStep();
      return;
    }

    // Verificar que se haya seleccionado al menos un item
    if (formData.acceptedItems.length === 0) {
      alert("Debes seleccionar al menos un tipo de item aceptado");
      return;
    }

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
          const confirmCreate = window.confirm(
            "Ya existe un punto de recogida cercano a estas coordenadas. ¿Deseas crear uno nuevo de todas formas?",
          );

          if (!confirmCreate) {
            return;
          }

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

      // Resetear también el estado de googleMapsUrl y volver al primer paso
      setGoogleMapsUrl("");
      setCurrentStep(0);
      setSelectedCommunity("");
      setSelectedProvince("");

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
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-teal-50 p-6">
      <div className="mx-auto max-w-4xl rounded-xl bg-white/80 p-6 shadow-xl backdrop-blur">
        {/* Indicador de progreso */}
        <div className="mb-8">
          <div className="flex justify-between">
            {FORM_STEPS.map((step, index) => (
              <div
                key={step.id}
                className="flex flex-1 items-center"
                onClick={() => setCurrentStep(index)}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                    index <= currentStep
                      ? "border-teal-500 bg-teal-50 text-teal-600"
                      : "border-gray-300 bg-white text-gray-500"
                  } cursor-pointer transition-colors duration-200`}
                >
                  {index + 1}
                </div>
                {index < FORM_STEPS.length - 1 && (
                  <div
                    className={`h-1 flex-1 ${
                      index < currentStep ? "bg-teal-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {FORM_STEPS[currentStep]?.title}
            </h2>
            <p className="text-sm text-gray-500">
              {FORM_STEPS[currentStep]?.description}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Paso 1: Información Básica */}
          {currentStep === 0 && (
            <div className="space-y-4 transition-all duration-300">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Nombre del punto
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="h-full w-full rounded-lg border border-gray-300 p-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Ubicación */}
          {currentStep === 1 && (
            <div className="space-y-4 transition-all duration-300">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Comunidad Autónoma
                  </label>
                  <select
                    value={selectedCommunity}
                    onChange={(e) => setSelectedCommunity(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    required
                  >
                    <option value="">Selecciona Comunidad Autónoma</option>
                    {communities.map((community) => (
                      <option key={community.label} value={community.label}>
                        {community.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Provincia
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={(e) => setSelectedProvince(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
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
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Municipio
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, city: e.target.value }))
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
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
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) =>
                      setFormData({ ...formData, postalCode: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    required
                  />
                </div>

                <div className="col-span-full space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    URL de Google Maps
                  </label>
                  <input
                    type="url"
                    value={googleMapsUrl}
                    onChange={handleGoogleMapsUrlChange}
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    placeholder="https://maps.google.com/..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Latitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        latitude: parseFloat(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Longitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        longitude: parseFloat(e.target.value),
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Contacto */}
          {currentStep === 2 && (
            <div className="space-y-4 transition-all duration-300">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Sitio Web
                  </label>
                  <input
                    type="url"
                    value={formData.website ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, website: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Horario
                  </label>
                  <input
                    type="text"
                    value={formData.schedule ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, schedule: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 p-3 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
                    placeholder="Ej: Lunes a Viernes 9:00-18:00"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 4: Items Aceptados */}
          {currentStep === 3 && (
            <div className="space-y-4 transition-all duration-300">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {Object.entries(ACCEPTED_ITEMS).map(([value, label]) => (
                  <label
                    key={value}
                    className="group relative flex cursor-pointer items-center rounded-lg border border-gray-200 p-4 hover:bg-teal-50"
                  >
                    <input
                      type="checkbox"
                      checked={formData.acceptedItems.includes(value)}
                      onChange={() => handleToggleItem(value)}
                      className="peer hidden"
                    />
                    <div className="absolute inset-0 rounded-lg border-2 transition-colors peer-checked:border-teal-500 peer-checked:bg-teal-50" />
                    <span className="relative z-10 text-gray-700 peer-checked:text-teal-600">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Botones de navegación */}
          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={prevStep}
              className={`rounded-lg px-6 py-2 text-sm font-medium transition-colors ${
                currentStep === 0
                  ? "invisible"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Anterior
            </button>

            {currentStep === FORM_STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-teal-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-600"
              >
                Guardar Localización
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNextStep}
                className="rounded-lg bg-teal-500 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-600"
              >
                Siguiente
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
