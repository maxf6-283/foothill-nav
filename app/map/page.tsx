"use client"; // For Next.js 13+ app router, or ignore if using pages router

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Map() {
  const mapContainer = useRef(null);
  const mapRef = useRef<maplibregl.Map>(null);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lngLat, setLngLat] = useState({ lng: 0, lat: 0 });

  useEffect(() => {
    if (mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style:
        "https://api.maptiler.com/maps/streets-v2/style.json?key=IB3MIEFaSnwKWw8vcwGF",
      center: [-122.128, 37.3613], // Longitude, latitude
      zoom: 16,
      maxBounds: [
        // restrict panning bounds
        [-122.136, 37.357], // southwest corner [lng, lat]
        [-122.1205, 37.367], // northeast corner [lng, lat]
      ],
    });

    mapRef.current = map;

    map.on("load", () => {
      console.log(map.getStyle().layers);
      map.setLayoutProperty("Park", "visibility", "visible");
      map.setLayerZoomRange("Park", 0, 24);
      fetch("/foothill.json")
        .then((res) => res.json())
        .then((data) => {
          map.addSource("foothill", {
            type: "geojson",
            data: data,
          });

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
                ["==", ["geometry-type"], "Polygon"]
            ],
          });

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
              ["has", "waterway"]
            ],
          });

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
              ["any",
                ["==", ["get", "highway"], "footway"],
                ["==", ["get", "foot"], "yes"]
              ],
            ],
          });

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

          map.addLayer({
            id: "steps",
            type: "line",
            source: "foothill",
            paint: {
              "line-color": "#cc8989",
              "line-width": 6,
              'line-dasharray': [0.5, 0.5]
            },
            filter: [
              "all",
              ["==", ["geometry-type"], "LineString"],
              ["==", ["get", "highway"], "steps"],
            ],
        });

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

        //   map.addLayer({
        //     id: "other-lines",
        //     type: "line",
        //     source: "foothill",
        //     paint: {
        //       "line-color": "#FF00FF",
        //       "line-width": 4,
        //     },
        //     filter: [
        //       "all",
        //       ["==", ["geometry-type"], "LineString"],
        //       ["!=", ["get", "highway"], "footway"],
        //       ["!=", ["get", "foot"], "yes"],
        //       ["!=", ["get", "highway"], "steps"],
        //       ["!", ["has", "waterway"]],
        //       ["!=", ["get", "highway"], "service"]
        //     ],
        //   });

          map.addLayer({
            id: 'building-labels',
            type: 'symbol',
            source: 'foothill',
            layout: {
              'text-field': ['get', 'name'],
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 12,
              'text-allow-overlap': false
            },
            paint: {
              'text-color': '#333'
            },
            filter: [
                "all",
                ["!=", ["get", "name"], "Foothill College"],
                ['==', ['geometry-type'], 'Polygon']
            ]
        });

          map.addLayer({
            id: 'stair-labels',
            type: 'symbol',
            source: 'foothill',
            layout: {
              'text-field': "stairs",
              'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
              'text-size': 12,
              'text-allow-overlap': false
            },
            paint: {
              'text-color': '#333'
            },
            filter: [
                "all",
                ["==", ["geometry-type"], "LineString"],
                ["==", ["get", "highway"], "steps"],
              ],
        });

          //   map.addLayer({
          //     id: "points",
          //     type: "circle",
          //     source: "foothill",
          //     paint: {
          //       "circle-radius": 6,
          //       "circle-color": "#007cbf",
          //     },
          //     filter: ["==", "$type", "Point"],
          //   });
        });
    });

    // 👇 Add mousemove handler to query features
    map.on("mousemove", (e) => {
      setLngLat({ lng: e.lngLat.lng, lat: e.lngLat.lat });

      const features = map.queryRenderedFeatures(e.point);
      if (features.length > 0) {
        setHoveredFeature(features[0].properties);
        setMousePos({
          x: e.originalEvent.clientX,
          y: e.originalEvent.clientY,
        });
      } else {
        setHoveredFeature(null);
      }
    });

    // Optional: clear on mouse leave
    map.on("mouseleave", () => {
      setHoveredFeature(null);
    });

    return () => map.remove(); // Cleanup on unmount
  }, []);

  return (
    <>
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: "100vh",
          position: "relative",
        }}
      />

      {/* Floating Tooltip */}
      {hoveredFeature && (
        <div
          style={{
            position: "fixed",
            top: mousePos.y + 10,
            left: mousePos.x + 10,
            background: "white",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "14px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            zIndex: 1000,
            pointerEvents: "none",
            color: "black",
          }}
        >
          {Object.entries(hoveredFeature).map(([key, value]) => (
            <div key={key}>
              <strong>{key}</strong>: {value.toString()}
            </div>
          ))}
          <div>
            <strong>lng</strong>: {lngLat.lng}
          </div>
          <div>
            <strong>lat</strong>: {lngLat.lat}
          </div>
        </div>
      )}
    </>
  );
}
