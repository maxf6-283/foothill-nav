export interface Location {
  name: string;
  coordinates: [number, number][]; // [longitude, latitude]
  highlightable?: boolean // true by default
  lot?: "no" | "student" | "staff" // "no" by default,
  link?: string
  floor?: number 
}

export const locations: Location[] = [
  {
    name: "Lot 1",
    coordinates: [
      [-122.1251737, 37.360561],
      [-122.1246187, 37.3608334],
      [-122.1260305, 37.360264]
    ],
    highlightable: false,
    lot: "student"
  },
  {
    name: "Lot 1-A",
    coordinates: [
      [-122.1265938, 37.360737],
      [-122.126939, 37.3606062]
    ],
    highlightable: false,
    lot: "student"
  },
  {
    name: "Lot 1-B",
    coordinates: [
      [-122.1256931, 37.3609855]
    ],
    highlightable: true,
    lot: "student"
  },
  {
    name: "Lot 1-C",
    coordinates: [
      [-122.1251018, 37.3614639],
      [-122.1252463, 37.3614345],
      [-122.124822, 37.361246]
    ],
    highlightable: true,
    lot: "student"
  },
  {
    name: "Lot 1-D",
    coordinates: [
      [-122.1254695, 37.3618776]
    ],
    highlightable: false,
    lot: "student"
  },
  {
    name: "Lot 1-E",
    coordinates: [
      [-122.1246747, 37.3619417]
    ],
    highlightable: false,
    lot: "student"
  },
  {
    name: "Lot 1-G",
    coordinates: [
      [-122.1224713, 37.3603082]
    ],
    highlightable: false,
    lot: "student"
  },
  {
    name: "Lot 1-H",
    coordinates: [
      [-122.1235123, 37.3614704]
    ],
    highlightable: false,
    lot: "student"
  },
  {
    name: "Lot 2",
    coordinates: [
      [-122.1296398, 37.3631001],
      [-122.1285068, 37.3632446],
      [-122.1278057, 37.363264],
      [-122.1275378, 37.3637314]
    ],
    highlightable: false,
    lot: "student"
  },
  {
    name: "Lot 2-A",
    coordinates: [
      [-122.1259506, 37.3636448],
      [-122.1253619, 37.3626018],
      [-122.12594, 37.3633841]
    ],
    highlightable: false,
    lot: "student"
  },
  {
    name: "Lot 3",
    coordinates: [
      [-122.1296398, 37.3631001],
      [-122.1307563, 37.3632094],
      [-122.1310305, 37.3635775],
      [-122.1320995, 37.3639472]
    ],
    highlightable: false,
    lot: "student"
  },
  {
    name: "Lot 4",
    coordinates: [
      [-122.1325517, 37.3616357],
      [-122.1330348, 37.3623985],
      [-122.13230621450765, 37.36174403980374],
      [-122.13195047409644, 37.36189339933504],
      [-122.1316, 37.3620437],
      [-122.1322159, 37.3627279]
    ],
    highlightable: false,
    lot: "student"
  },
  {
    name: "Lot 4-A",
    coordinates: [
      [-122.1306788, 37.3624514],
      [-122.1311117, 37.3621697]
    ],
    highlightable: false,
    lot: "student"
  },
  {
    name: "Lot 4-B",
    coordinates: [
      [-122.1320628, 37.3629204],
      [-122.1321849, 37.3630562]
    ],
    highlightable: true,
    lot: "student"
  },
  {
    name: "Lot 4-C",
    coordinates: [
      [-122.1325517, 37.3616357],
      [-122.132404, 37.3614239]
    ],
    highlightable: true,
    lot: "student"
  },
  {
    name: "Lot 5",
    coordinates: [
      [-122.1307338, 37.3605939]
    ],
    highlightable: false,
    lot: "student"
  },
  {
    name: "Lot 6",
    coordinates: [
      [-122.1299358, 37.3601415],
      [-122.1303023, 37.3600101]
    ],
    highlightable: false,
    lot: "student",
    link: "https://maps.app.goo.gl/rHYKK9wUhPTAJmQx9"
  },
  {
    name: "Lot 7",
    coordinates: [
      [-122.1280499, 37.3590505]
    ],
    highlightable: false,
    lot: "student"
  },
  {
    name: "Lot 8",
    coordinates: [
      [-122.1278903, 37.3592244],
      [-122.128069, 37.3595935],
      [-122.127182, 37.3599049],
      [-122.1281147, 37.359406],
      [-122.1269728, 37.3597881]
    ],
    highlightable: false,
    lot: "student",
    link: "https://maps.app.goo.gl/khwGBYUWDCGVakoP7"
  },
  {
    name: "Foothill College Observatory",
    coordinates: [
      [-122.1318169, 37.3629361]
    ],
  },
  {
    name: "Hubert H. Semans Library (3500)",
    coordinates: [
      [-122.1292586, 37.3617138]
    ]
  },
  {
    name: "Science Space Center and Krause Center for Innovation (4000)",
    coordinates: [
      [-122.1314652, 37.3629183]
    ]
  },
  {
    name: "D100",
    coordinates: [
      [-122.1253808, 37.3611988]
    ]
  },
  {
    name: "D120",
    coordinates: [
      [-122.124755, 37.3616876]
    ]
  },
  {
    name: "4050",
    coordinates: [
      [-122.1323532, 37.3630496]
    ],
  },
  {
    name: "4400",
    coordinates: [
      [-122.13161153793507, 37.36138725730899],
      [-122.1318015, 37.3616705]
    ],
  },
  {
    name: "4500",
    coordinates: [
      [-122.1318015, 37.3616705],
      [-122.13195047409644, 37.36189339933504],
      [-122.1316, 37.3620437],
      [-122.1314352, 37.3618246],
      [-122.131574, 37.3620071]
    ],
  },
  {
    name: "4600",
    coordinates: [
      [-122.13213033306712, 37.36153531443658],
      [-122.13215633434291, 37.36152415370226],
      [-122.13230621450765, 37.36174403980374],
      [-122.13195047409644, 37.36189339933504],
      [-122.1318015, 37.3616705]
    ],
  },
  {
    name: "4700-4800",
    coordinates: [
      [-122.13209654586585, 37.361170353148665],
      [-122.13204589719953, 37.36119227952892],
      [-122.13161153793507, 37.36138725730899],
      [-122.13150243585272, 37.361240063302134],
      [-122.13144697320746, 37.36122856900376],
      [-122.1314922201547, 37.36129752353328]
    ]
  },
  {
    name: "4700",
    coordinates: [
      [-122.13144697320746, 37.36122856900376],
      [-122.1314922201547, 37.36129752353328]
    ],
    floor: 1
  },
  {
    name: "4800",
    coordinates: [
      [-122.13209654586585, 37.361170353148665],
      [-122.13204589719953, 37.36119227952892],
      [-122.13161153793507, 37.36138725730899],
      [-122.13150243585272, 37.361240063302134]
    ],
    floor: 2
  },
  {
    name: "7000",
    coordinates: [
      [-122.1289149, 37.3599091]
    ]
  },
  {
    name: "7100",
    coordinates: [
      [-122.1291371, 37.3599408]
    ]
  },
  {
    name: "7200",
    coordinates: [
      [-122.1291248, 37.3598606]
    ]
  },
  {
    name: "7400",
    coordinates: [
      [-122.1298797, 37.3601321]
    ]
  },
  {
    name: "8500-8700",
    coordinates: [
      [-122.1287429, 37.3602332],
      [-122.1282643, 37.3599938],
      [-122.1281501, 37.359938],
      [-122.1282093, 37.3598351],
      [-122.1284326, 37.3597849]
    ]
  }
]; 