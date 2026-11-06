export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type bsc5Type = {
  columns: string[],
  data: [number, string | null, number, number, number, string | null, number][]
}

export type citiesType = [string, number, number][]