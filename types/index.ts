export type Route = {
  id: string | number;
  routeCode: string;
  name?: string | null;
  active?: boolean | null;
};

export type Stop = {
  id: string | number;
  name?: string | null;
  nameTh?: string | null;
  nameEn?: string | null;
  latitude: number;
  longitude: number;
  sequence?: number | null;
  stopOrder?: number | null;
};

export type Vehicle = {
  id: string | number;
  name?: string | null;
  type?: string | null;
  routeId?: string | null;
  status?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};
