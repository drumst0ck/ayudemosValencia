"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export function WelcomePopup() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const hasSeenWelcome = Cookies.get("hasSeenWelcome");
    if (hasSeenWelcome) {
      setIsVisible(false);
    } else {
      Cookies.set("hasSeenWelcome", "true", { expires: 2 });
    }
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[1002] bg-black bg-opacity-50" />
      
      {/* Popup */}
      <div className="fixed left-1/2 top-1/2 z-[1003] w-[90%] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-2xl font-bold text-teal-600">
          ¡Bienvenido/a a Puntos de Ayuda DANA!
        </h2>
        
        <div className="space-y-4 text-gray-600">
          <p>
            Este mapa interactivo muestra todos los puntos de recogida de donaciones
            para ayudar a las personas afectadas por la DANA en Valencia.
          </p>
          
          <p>
            Cada marcador en el mapa representa un punto donde puedes llevar tus
            donaciones. Al hacer clic en ellos, podrás ver:
          </p>
          
          <ul className="ml-6 list-disc space-y-2">
            <li>Dirección exacta del punto de recogida</li>
            <li>Tipos de donaciones que aceptan</li>
            <li>Horarios de recepción</li>
            <li>Información de contacto</li>
          </ul>
          
          <p>
            Usa los filtros para encontrar los puntos más cercanos a ti o para
            buscar lugares que acepten donaciones específicas.
          </p>
        </div>

        <button
          onClick={() => setIsVisible(false)}
          className="mt-6 w-full rounded-lg bg-teal-500 px-4 py-2 text-white transition hover:bg-teal-600"
        >
          Entendido
        </button>
      </div>
    </>
  );
} 