export type Town = {
  parent_code: string;
  code: string;
  label: string;
};

export type Province = {
  code: string;
  label: string;
  towns: Town[];
};

export type Community = {
  code: string;
  label: string;
  provinces: Province[];
};

// Tipo para los filtros de localización
export type LocationFilters = {
  autonomousCommunity?: string;
  province?: string;
  city?: string;
  acceptedItems?: string[];
};
