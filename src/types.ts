export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type bsc5Type = {
  columns: string[],
  data: [number, string | null, number, number, number, string | null, number, string | null][]
}

export type citiesType = [string, number, number][]

export type boxValuesType = {cityBox: string, latitudeBox: string, longitudeBox: string, starBox: string}