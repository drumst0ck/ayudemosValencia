export interface Town {
  parent_code: string;
  code: string;
  label: string;
}

export interface Province {
  parent_code: string;
  code: string;
  label: string;
  towns: Town[];
}

export interface Community {
  parent_code: string;
  label: string;
  code: string;
  provinces: Province[];
}
