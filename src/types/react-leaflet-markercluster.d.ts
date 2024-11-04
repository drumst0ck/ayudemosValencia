declare module "react-leaflet-markercluster" {
  import { FC } from "react";
  import L from "leaflet";

  interface MarkerClusterGroupProps {
    children: React.ReactNode;
    chunkedLoading?: boolean;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    zoomToBoundsOnClick?: boolean;
    maxClusterRadius?: number;
    iconCreateFunction?: (cluster: L.MarkerCluster) => L.DivIcon;
  }

  const MarkerClusterGroup: FC<MarkerClusterGroupProps>;
  export default MarkerClusterGroup;
}
