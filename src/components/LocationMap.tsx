"use client";

import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { type Location } from "@/schemas/location";
import { ACCEPTED_ITEMS } from "@/constants/items";
import L from "leaflet";
import "leaflet.markercluster";
import MarkerClusterGroup from 'react-leaflet-markercluster';
import 'react-leaflet-markercluster/dist/styles.min.css';
import { Phone, Mail, Clock, MapPin, Info } from 'lucide-react';

type LocationMapProps = {
  locations: Location[];
};

type AcceptedItemKey = keyof typeof ACCEPTED_ITEMS;

// Función mejorada para generar IDs únicos usando timestamp y datos del elemento
const generateLocationKey = (location: Location) => {
  return `${location?.id}-${location.latitude}-${location.longitude}`;
};

const generateAcceptedItemKey = (item: string, locationId: string, index: number) => {
  return `${locationId}-${item}-${index}`;
};

// Inicializar los iconos una sola vez
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "leaflet/marker-icon-2x.png",
    iconUrl: "leaflet/marker-icon.png",
    shadowUrl: "leaflet/marker-shadow.png",
  });
}

const MARKER_ICON = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#14b8a6" width="32" height="32">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zM12 11.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>
`;

const customIcon = L.divIcon({
  className: "custom-marker",
  html: MARKER_ICON,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const createClusterCustomIcon = (cluster: L.MarkerCluster) => {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<div class="cluster-marker">${count}</div>`,
    className: 'custom-cluster-marker',
    iconSize: L.point(40, 40),
  });
};

export function LocationMap({ locations }: LocationMapProps) {
  const center = { lat: 40.4167, lng: -3.7037 };
  const zoom = 6;

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="h-[100vh] w-full md:h-[100vh]"
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <div className="leaflet-control-container">
        <div className="leaflet-top leaflet-right">
          <div className="leaflet-control-zoom leaflet-bar leaflet-control">
            <a
              className="leaflet-control-zoom-in"
              href="#"
              title="Zoom in"
              role="button"
              aria-label="Zoom in"
            >
              +
            </a>
            <a
              className="leaflet-control-zoom-out"
              href="#"
              title="Zoom out"
              role="button"
              aria-label="Zoom out"
            >
              −
            </a>
          </div>
        </div>
      </div>
      <MarkerClusterGroup
        chunkedLoading
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={true}
        zoomToBoundsOnClick={true}
        maxClusterRadius={50}
        iconCreateFunction={createClusterCustomIcon}
      >
        {locations.map((location) => (
          <Marker
            key={generateLocationKey(location)}
            position={[location.latitude, location.longitude]}
            icon={customIcon}
          >
            <Popup className="location-popup">
              <div className="space-y-4">
                {/* Encabezado */}
                <div className="border-b border-gray-200 pb-2">
                  <h3 className="text-lg font-semibold text-teal-600">{location.name}</h3>
                  {location.description && location.description.trim() !== "" && (
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
                      <Info className="h-4 w-4 flex-shrink-0" />
                      <p className="flex-1">{location.description}</p>
                    </div>
                  )}
                </div>

                {/* Dirección */}
                <div className="flex items-center gap-1.5 text-sm">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-gray-500" />
                  <div className="flex-1">
                    <p className="text-gray-900">{location.address}</p>
                    <p className="text-gray-600">
                      {location.postalCode} {location.city}, {location.province}
                    </p>
                  </div>
                </div>

                {/* Contacto */}
                <div className="space-y-2">
                  {location.phone && location.phone.trim() !== "" && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <Phone className="h-4 w-4 flex-shrink-0 text-gray-500" />
                      <a 
                        href={`tel:${location.phone}`}
                        className="flex-1 text-teal-600 hover:underline"
                      >
                        {location.phone}
                      </a>
                    </div>
                  )}
                  {location.email && location.email.trim() !== "" && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <Mail className="h-4 w-4 flex-shrink-0 text-gray-500" />
                      <a 
                        href={`mailto:${location.email}`}
                        className="flex-1 text-teal-600 hover:underline"
                      >
                        {location.email}
                      </a>
                    </div>
                  )}
                  {location.schedule && location.schedule.trim() !== "" && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <Clock className="h-4 w-4 flex-shrink-0 text-gray-500" />
                      <p className="flex-1 text-gray-600">{location.schedule}</p>
                    </div>
                  )}
                </div>

                {/* Items Aceptados */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900">Acepta:</h4>
                  <div className="flex flex-wrap gap-2">
                    {location.acceptedItems.map((item, index) => (
                      <span
                        key={generateAcceptedItemKey(item, location.id, index)}
                        className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700"
                      >
                        {ACCEPTED_ITEMS[item as AcceptedItemKey] ?? item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Enlaces adicionales */}
                {location.googleMapsUrl && (
                  <div className="border-t border-gray-200 pt-2">
                    <a
                      href={location.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700"
                    >
                      <MapPin className="h-4 w-4" />
                      Ver en Google Maps
                    </a>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

export default LocationMap;
