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
  },
  {
    name: "Test",
    coordinates: [-122.129175, 37.361495]
  },
  {
    name: "Test2",
    coordinates: [-122.1301, 37.361295]
  },
  {
    name: "Test3",
    coordinates: [-122.129478, 37.361363]
  },
  {
    name: "Test5",
    coordinates: [-122.12955, 37.36136439]
  },
  {
    name: "Test4",
    coordinates: [-122.1304173, 37.36108777]
  }
]; 