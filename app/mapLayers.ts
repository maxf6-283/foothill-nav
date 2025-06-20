import { Map as MapLibreMap } from 'maplibre-gl';
import { Feature, LineString, Position, FeatureCollection } from 'geojson';

export const addMapLayers = (map: MapLibreMap, data: FeatureCollection, path?: { path: Position[] }) => {
  // Add the main source
  map.addSource("foothill", {
    type: "geojson",
    data: data,
  });

  // College area
  map.addLayer({
    id: "foothill-college",
    type: "fill",
    source: "foothill",
    paint: {
      "fill-color": "#e8f5e9",
      "fill-opacity": 0.8,
      "fill-outline-color": "#81c784"
    },
    filter: ["==", ["get", "name"], "Foothill College"],
  });

  // Buildings
  map.addLayer({
    id: "buildings",
    type: "fill",
    source: "foothill",
    paint: {
      "fill-color": "#bbdefb",
      "fill-opacity": 0.9,
      "fill-outline-color": "#64b5f6"
    },
    filter: ["==", ["get", "building"], "college"],
  });

  // Parking lots
  map.addLayer({
    id: "lots",
    type: "fill",
    source: "foothill",
    paint: {
      "fill-color": "#e0e0e0",
      "fill-opacity": 0.8,
      "fill-outline-color": "#9e9e9e"
    },
    filter: ["==", ["get", "amenity"], "parking"],
  });

  // Other polygons
  map.addLayer({
    id: "other-poly",
    type: "fill",
    source: "foothill",
    paint: {
      "fill-color": "#e3f2fd",
      "fill-opacity": 0.6,
      "fill-outline-color": "#90caf9"
    },
    filter: [
      "all",
      ["!=", ["get", "name"], "Foothill College"],
      ["!=", ["get", "amenity"], "parking"],
      ["!=", ["get", "building"], "college"],
      ["==", ["geometry-type"], "Polygon"],
    ],
  });

  // Waterways
  map.addLayer({
    id: "waterways",
    type: "line",
    source: "foothill",
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": "#4fc3f7",
      "line-width": 6,
      "line-opacity": 0.8
    },
    filter: [
      "all",
      ["==", ["geometry-type"], "LineString"],
      ["has", "waterway"],
    ],
  });

  // Footways
  map.addLayer({
    id: "footways",
    type: "line",
    source: "foothill",
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": "#81c784",
      "line-width": 4,
      "line-opacity": 0.9
    },
    filter: [
      "all",
      ["==", ["geometry-type"], "LineString"],
      [
        "any",
        ["==", ["get", "highway"], "footway"],
        ["==", ["get", "highway"], "path"],
        ["==", ["get", "foot"], "yes"],
      ],
    ],
  });

  // Steep path
  map.addLayer({
    id: "steep-path",
    type: "line",
    source: "foothill",
    paint: {
      "line-color": "#ef83b0",
      "line-width": 6,
      "line-opacity": 0.8
    },
    filter: [
      "all",
      ["==", ["geometry-type"], "LineString"],
      ["==", ["get", "highway"], "steep footway"],
    ],
  });

  // Steps background
  map.addLayer({
    id: "steps-bg",
    type: "line",
    source: "foothill",
    paint: {
      "line-color": "#ef83b0",
      "line-width": 6,
      "line-opacity": 0.8
    },
    filter: [
      "all",
      ["==", ["geometry-type"], "LineString"],
      ["==", ["get", "highway"], "steps"],
    ],
  });

  // Steps
  map.addLayer({
    id: "steps",
    type: "line",
    source: "foothill",
    paint: {
      "line-color": "#ffe880",
      "line-width": 4,
      "line-dasharray": [1.5, 1.5],
      "line-opacity": 0.9
    },
    filter: [
      "all",
      ["==", ["geometry-type"], "LineString"],
      ["==", ["get", "highway"], "steps"],
    ],
  });

  //Elevators
  map.addLayer({
    id: "elevator",
    type: "line",
    source: "foothill",
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": "#ffb74d",
      "line-width": 8,
      "line-opacity": 0.9
    },
    filter: [
      "all",
      ["==", ["geometry-type"], "LineString"],
      ["==", ["get", "elevator"], "yes"],
    ],
  });

  // Roads
  map.addLayer({
    id: "roads",
    type: "line",
    source: "foothill",
    layout: {
      "line-join": "round",
      "line-cap": "round"
    },
    paint: {
      "line-color": "#b0bec5",
      "line-width": 6,
      "line-opacity": 0.8
    },
    filter: [
      "all",
      ["==", ["geometry-type"], "LineString"],
      ["==", ["get", "highway"], "service"],
    ],
  });

  // Route path if available
  if (path) {
    map.addSource("route", {
      type: "geojson",
      data: {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: path.path,
        },
        properties: {}
      } as Feature<LineString>,
    });

    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      layout: {
        "line-join": "round",
        "line-cap": "round"
      },
      paint: {
        'line-color': '#ffd600',
        'line-width': 6,
        'line-opacity': 0.8,
        'line-dasharray': [2, 2]
      }
    });
  }

  // Building labels
  map.addLayer({
    id: "building-labels",
    type: "symbol",
    source: "foothill",
    layout: {
      "text-field": ["get", "name"],
      "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      "text-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14, 6,
        17, 9,
        20, 14
      ],
      "text-allow-overlap": false,
      "text-ignore-placement": false,
      "text-optional": true
    },
    paint: {
      "text-color": "#37474f",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1
    },
    filter: [
      "all",
      ["!=", ["get", "name"], "Foothill College"],
      ["==", ["geometry-type"], "Polygon"],
    ],
  });

  // Stair labels
  map.addLayer({
    id: "stair-labels",
    type: "symbol",
    source: "foothill",
    layout: {
      "text-field": "Stairs",
      "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      "text-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14, 6,
        17, 9,
        20, 14
      ],
      "text-allow-overlap": false,
      "text-ignore-placement": false,
      "text-optional": true
    },
    paint: {
      "text-color": "#d32f2f",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1
    },
    filter: [
      "all",
      ["==", ["geometry-type"], "LineString"],
      ["==", ["get", "highway"], "steps"],
    ],
  });

  // Steep path labels
  map.addLayer({
    id: "steep-path-labels",
    type: "symbol",
    source: "foothill",
    layout: {
      "text-field": "Steep path",
      "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      "text-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14, 6,
        17, 9,
        20, 14
      ],
      "text-allow-overlap": false,
      "text-ignore-placement": false,
      "text-optional": true
    },
    paint: {
      "text-color": "#d32f2f",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1
    },
    filter: [
      "all",
      ["==", ["geometry-type"], "LineString"],
      ["==", ["get", "highway"], "steep footway"],
    ],
  });

  // Elevator labels
  map.addLayer({
    id: "elevator-labels",
    type: "symbol",
    source: "foothill",
    layout: {
      "text-field": "Elevator",
      "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      "text-size": [
        "interpolate",
        ["linear"],
        ["zoom"],
        14, 6,
        17, 9,
        20, 14
      ],
      "text-allow-overlap": false,
      "text-ignore-placement": false,
      "text-optional": true
    },
    paint: {
      "text-color": "#f57c00",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1
    },
    filter: [
      "all",
      ["==", ["geometry-type"], "LineString"],
      ["==", ["get", "elevator"], "yes"],
    ],
  });
}; 