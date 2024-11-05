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

function InstructionsModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-gray-800">
          Instrucciones para añadir un punto de recogida
        </h2>

        <div className="space-y-4 text-gray-600">
          <section>
            <h3 className="font-semibold text-gray-700">
              1. Información Básica
            </h3>
            <p>
              • Nombre: Identifica el punto de recogida (ej: "Parroquia San
              Juan")
            </p>
            <p>• Descripción: Detalles adicionales sobre el punto (opcional)</p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-700">2. Ubicación</h3>
            <p>• Selecciona la Comunidad Autónoma, Provincia y Municipio</p>
            <p>• Introduce la dirección completa y código postal</p>
            <p className="font-medium text-teal-600">
              Tip para las coordenadas:
            </p>
            <ul className="ml-4 list-disc">
              <li>Busca la ubicación en Google Maps</li>
              <li>Copia la URL desde la barra de direcciones</li>
              <li>Pégala en el campo "URL de Google Maps"</li>
              <li>¡Las coordenadas se rellenarán automáticamente!</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-700">
              3. Contacto (Opcional)
            </h3>
            <p>• Teléfono: Número de contacto</p>
            <p>• Email: Correo electrónico</p>
            <p>• Web: Página web si existe</p>
            <p>• Horario: Ej: "Lunes a Viernes 9:00-18:00"</p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-700">4. Items Aceptados</h3>
            <p>
              • Selecciona al menos un tipo de item que se acepta en el punto
            </p>
            <p>• Puedes seleccionar múltiples opciones</p>
          </section>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-teal-500 py-2 text-white hover:bg-teal-600"
        >
          Entendido
        </button>
      </div>
    </div>
  );
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

  const [currentStep, setCurrentStep] = useState(0);

  const [showInstructions, setShowInstructions] = useState(false);

  // Agregar esta función para validar cada paso
  const validateStep = (step: number) => {
    switch (step) {
      case 0:
        return !!formData.name;
      case 1:
        return !!(
          formData.address &&
          formData.postalCode &&
          formData.city &&
          formData.province &&
          formData.autonomousCommunity &&
          formData.latitude &&
          formData.longitude
        );
      case 2:
        // El paso 3 no tiene campos obligatorios
        return true;
      case 3:
        return formData.acceptedItems.length > 0;
      default:
        return false;
    }
  };

  // Modificar la función que maneja el cambio de paso
  const handleStepChange = (newStep: number) => {
    // Si intentamos avanzar, validamos el paso actual
    if (newStep > currentStep) {
      for (let i = currentStep; i < newStep; i++) {
        if (!validateStep(i)) {
          alert(
            "Por favor completa todos los campos obligatorios antes de continuar",
          );
          return;
        }
      }
    }
    setCurrentStep(newStep);
  };

  // Modificar las funciones de navegación existentes
  const nextStep = () => {
    if (currentStep < FORM_STEPS.length - 1 && validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    } else if (!validateStep(currentStep)) {
      alert(
        "Por favor completa todos los campos obligatorios antes de continuar",
      );
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
      if (!formData.name) {
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

    // Validar que las coordenadas sean números válidos
    if (isNaN(formData.latitude) || isNaN(formData.longitude)) {
      alert("Las coordenadas no son válidas");
      return;
    }

    // Crear una copia limpia de los datos
    const cleanFormData = {
      ...formData,
      latitude: Number(formData.latitude),
      longitude: Number(formData.longitude),
      // Asegurar que los campos opcionales sean undefined si están vacíos
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      website: formData.website || undefined,
      schedule: formData.schedule || undefined,
      description: formData.description || undefined,
      googleMapsUrl: formData.googleMapsUrl || undefined,
    };

    try {
      let url = "/api/locations";
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanFormData),
      };

      // Primera petición
      let response = await fetch(url, requestOptions);
      let data = await response.json();

      // Si hay un punto cercano, preguntar al usuario
      if (response.status === 409) {
        const confirmCreate = window.confirm(
          "Ya existe un punto de recogida cercano a estas coordenadas. ¿Deseas crear uno nuevo de todas formas?",
        );

        if (!confirmCreate) {
          return;
        }

        // Si el usuario confirma, hacer la petición con force=true
        url = "/api/locations?force=true";
        response = await fetch(url, requestOptions);
        data = await response.json();
      }

      // Si la respuesta no es exitosa, lanzar error
      if (!response.ok) {
        throw new Error(data.error || "Error al guardar la localización");
      }

      // Si todo fue exitoso, resetear el formulario
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
    <div className="p-6">
      <div className="mx-auto max-w-4xl rounded-xl bg-white/80 p-6 shadow-xl backdrop-blur">
        {/* Agregar el botón de ayuda */}
        <button
          onClick={() => setShowInstructions(true)}
          className="mb-4 flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600 hover:bg-gray-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path d="M12 16v-4" strokeWidth="2" />
            <path d="M12 8h.01" strokeWidth="2" />
          </svg>
          Ver instrucciones
        </button>

        {/* Agregar el modal */}
        <InstructionsModal
          isOpen={showInstructions}
          onClose={() => setShowInstructions(false)}
        />

        {/* Indicador de progreso */}
        <div className="mb-8">
          <div className="relative mx-auto max-w-2xl">
            <div className="flex items-center justify-between">
              {/* Líneas de fondo */}
              <div className="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-gray-300" />

              {/* Línea de progreso */}
              <div
                className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-teal-500 transition-all duration-300"
                style={{
                  width: `${(currentStep / (FORM_STEPS.length - 1)) * 100}%`,
                }}
              />

              {/* Círculos numerados */}
              {FORM_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className="relative flex items-center justify-center"
                  onClick={() => handleStepChange(index)}
                >
                  <div
                    className={`z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white ${
                      index <= currentStep
                        ? "border-teal-500 bg-teal-50 text-teal-600"
                        : "border-gray-300 text-gray-500"
                    } ${
                      index > currentStep + 1
                        ? "cursor-not-allowed"
                        : "cursor-pointer"
                    } transition-colors duration-200`}
                  >
                    {index + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Título y descripción del paso */}
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
