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
                    {location.acceptedItems.map((item, index) => (
                      <li key={generateAcceptedItemKey(item, location.id, index)}>
                        {ACCEPTED_ITEMS[item as AcceptedItemKey] ?? item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}

export default LocationMap;
