export interface Location {
  name: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export const locations: Location[] = [
  {
    name: "Library",
    coordinates: [-122.1290835, 37.3615535]
  },
  {
    name: "Cafeteria",
    coordinates: [-122.1235467, 37.3615772]
  },
  {
    name: "Parking Lot",
    coordinates: [-122.1285, 37.3595]
  },
  {
    name: "Classroom Building",
    coordinates: [-122.1275, 37.3625]
  }
]; 