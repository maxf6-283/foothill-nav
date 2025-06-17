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
      "fill-color": "#89cc9b",
      "fill-opacity": 1.0,
    },
    filter: ["==", ["get", "name"], "Foothill College"],
  });

  // Buildings
  map.addLayer({
    id: "buildings",
    type: "fill",
    source: "foothill",
    paint: {
      "fill-color": "#89a9cc",
      "fill-opacity": 1.0,
    },
    filter: ["==", ["get", "building"], "college"],
  });

  // Parking lots
  map.addLayer({
    id: "lots",
    type: "fill",
    source: "foothill",
    paint: {
      "fill-color": "#898ccc",
      "fill-opacity": 1.0,
    },
    filter: ["==", ["get", "amenity"], "parking"],
  });

  // Other polygons
  map.addLayer({
    id: "other-poly",
    type: "fill",
    source: "foothill",
    paint: {
      "fill-color": "#89a9cc",
      "fill-opacity": 0.5,
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
    paint: {
      "line-color": "#4b50d6",
      "line-width": 8,
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
    paint: {
      "line-color": "#cc8989",
      "line-width": 6,
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

  // Steps background
  map.addLayer({
    id: "steps-bg",
    type: "line",
    source: "foothill",
    paint: {
      "line-color": "#FF8989",
      "line-width": 6,
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
      "line-color": "#cc8989",
      "line-width": 6,
      "line-dasharray": [0.5, 0.5],
    },
    filter: [
      "all",
      ["==", ["geometry-type"], "LineString"],
      ["==", ["get", "highway"], "steps"],
    ],
  });

  // Roads
  map.addLayer({
    id: "roads",
    type: "line",
    source: "foothill",
    paint: {
      "line-color": "#bae6de",
      "line-width": 8,
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
        properties: {} // Add empty properties to satisfy GeoJSON type
      } as Feature<LineString>,
    });

    map.addLayer({
      id: 'route-line',
      type: 'line',
      source: 'route',
      paint: {
        'line-color': '#ffff00',
        'line-width': 8,
        'line-opacity': 0.7
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
      "text-size": 12,
      "text-allow-overlap": false,
    },
    paint: {
      "text-color": "#333",
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
      "text-field": "stairs",
      "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      "text-size": 12,
      "text-allow-overlap": false,
    },
    paint: {
      "text-color": "#333",
    },
    filter: [
      "all",
      ["==", ["geometry-type"], "LineString"],
      ["==", ["get", "highway"], "steps"],
    ],
  });
}; 