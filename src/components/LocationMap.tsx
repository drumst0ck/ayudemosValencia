"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { type Location } from "@/schemas/location";
import { ACCEPTED_ITEMS } from "@/constants/items";

type LocationMapProps = {
  locations: Location[];
};

// Definir el tipo para las claves de ACCEPTED_ITEMS
type AcceptedItemKey = keyof typeof ACCEPTED_ITEMS;

// Función para generar IDs únicos
const generateUniqueId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export function LocationMap({ locations }: LocationMapProps) {
  // Centrar el mapa en España
  const center = { lat: 40.4167, lng: -3.7037 };
  const zoom = 6;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-[calc(100vh-4rem)] w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {locations.map((location) => (
        <Marker
          key={generateUniqueId()}
          position={[location.latitude, location.longitude]}
        >
          <Popup>
            <div className="space-y-2">
              <h3 className="font-semibold">{location.name}</h3>
              <p className="text-sm">{location.description}</p>
              <p className="text-sm">
                {location.address}, {location.postalCode}
                <br />
                {location.city}, {location.province}
              </p>
              {location.phone && (
                <p className="text-sm">
                  📞 <a href={`tel:${location.phone}`}>{location.phone}</a>
                </p>
              )}
              {location.email && (
                <p className="text-sm">
                  ✉️ <a href={`mailto:${location.email}`}>{location.email}</a>
                </p>
              )}
              <div className="text-sm">
                <strong>Acepta:</strong>
                <ul className="list-inside list-disc">
                  {location.acceptedItems.map((item) => (
                    <li key={generateUniqueId()}>
                      {ACCEPTED_ITEMS[item as AcceptedItemKey] ?? item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
