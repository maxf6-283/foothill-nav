"use client"; // For Next.js 13+ app router, or ignore if using pages router

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import PathFinder from "geojson-path-finder";
import * as turf from "@turf/turf";
import { addMapLayers } from "./mapLayers";
import BottomMenu from "./components/BottomMenu";

interface FeatureProperties {
  highway?: string;
  foot?: string;
  [key: string]: any;
}

export default function Map() {
  const mapContainer = useRef(null);
  const mapRef = useRef<maplibregl.Map>(null);
  const dataRef = useRef<any>(null);
  const pathfinderRef = useRef<PathFinder<any, FeatureProperties> | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<FeatureProperties | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lngLat, setLngLat] = useState({ lng: 0, lat: 0 });
  const [isStepFree, setIsStepFree] = useState(false);

  const calculatePath = () => {
    if (!mapRef.current || !pathfinderRef.current) return;

    const start = turf.point([-122.1290835, 37.3615535]);
    const end = turf.point([-122.1235467, 37.3615772]);
    const path = pathfinderRef.current.findPath(start, end);

    // Remove existing route layer if it exists
    if (mapRef.current.getLayer('route-line')) {
      mapRef.current.removeLayer('route-line');
    }
    if (mapRef.current.getSource('route')) {
      mapRef.current.removeSource('route');
    }

    // Add new route
    if (path) {
      mapRef.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: path.path,
          },
          properties: {}
        },
      });

      mapRef.current.addLayer({
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
  };

  useEffect(() => {
    if (mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainer.current as any,
      style:
        "https://api.maptiler.com/maps/basic-v2/style.json?key=IB3MIEFaSnwKWw8vcwGF",
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
      fetch("/foothill.json")
        .then((res) => res.json())
        .then((data) => {
          dataRef.current = data;
          
          // Create pathfinder instance
          const pathfinder = new PathFinder<any, FeatureProperties>(data, {
            weight: (a, b, properties: FeatureProperties) => {
              if (properties.highway === "steps") {
                return isStepFree ? 1000 : 2; // Make steps very expensive if step-free is enabled
              }
              else if (properties.highway === "footway" || properties.foot === "yes") {
                return 1;
              }
              return 100;
            }
          });
          pathfinderRef.current = pathfinder;

          // Add all map layers
          addMapLayers(map, data);
          
          // Calculate initial path
          calculatePath();
        });
    });

    // 👇 Add mousemove handler to query features
    map.on("mousemove", (e) => {
      setLngLat({ lng: e.lngLat.lng, lat: e.lngLat.lat });

      const features = map.queryRenderedFeatures(e.point);
      if (features.length > 0) {
        setHoveredFeature(features[0].properties as FeatureProperties);
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
  }, []); // Removed isStepFree from dependencies

  // Effect to recalculate path when step-free option changes
  useEffect(() => {
    if (!pathfinderRef.current) return;

    // Update pathfinder weights
    pathfinderRef.current = new PathFinder<any, FeatureProperties>(dataRef.current, {
      weight: (a, b, properties: FeatureProperties) => {
        if (properties.highway === "steps") {
          return isStepFree ? 1000 : 2;
        }
        else if (properties.highway === "footway" || properties.foot === "yes") {
          return 1;
        }
        return 100;
      }
    });

    // Recalculate path
    calculatePath();
  }, [isStepFree]);

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
              <strong>{key}</strong>: {value?.toString()}
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

      <BottomMenu isStepFree={isStepFree} onStepFreeChange={setIsStepFree} />
    </>
  );
}
