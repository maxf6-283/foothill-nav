"use client"; // For Next.js 13+ app router, or ignore if using pages router

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import PathFinder from "geojson-path-finder";
import * as turf from "@turf/turf";
import { addMapLayers } from "./mapLayers";
import BottomMenu from "./components/BottomMenu";
import { Feature, FeatureCollection } from "geojson";

interface FeatureProperties {
  highway?: string;
  foot?: string;
  [key: string]: unknown;
}

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map>(null);
  const dataRef = useRef<FeatureCollection | null>(null);
  const pathfinderRef = useRef<PathFinder<Feature, FeatureProperties> | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<FeatureProperties | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lngLat, setLngLat] = useState({ lng: 0, lat: 0 });
  const [isStepFree, setIsStepFree] = useState(false);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [startLocation, setStartLocation] = useState<[number, number] | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [pathError, setPathError] = useState<string | null>(null);

  // Function to update markers
  const updateMarkers = () => {
    if (!mapRef.current) return;

    console.log("RAAA")

    // Remove existing markers if they exist
    if (mapRef.current.getLayer('start-marker')) {
      mapRef.current.removeLayer('start-marker');
    }
    if (mapRef.current.getSource('start-marker')) {
      mapRef.current.removeSource('start-marker');
    }
    if (mapRef.current.getLayer('end-marker')) {
      mapRef.current.removeLayer('end-marker');
    }
    if (mapRef.current.getSource('end-marker')) {
      mapRef.current.removeSource('end-marker');
    }

    // Add start marker if we have a start location
    const startPoint = startLocation ? startLocation : 
                      userLocation ? userLocation : null;
    
    if (startPoint) {
      mapRef.current.addSource('start-marker', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: startPoint
          },
          properties: {}
        }
      });

      mapRef.current.addLayer({
        id: 'start-marker',
        type: 'circle',
        source: 'start-marker',
        paint: {
          'circle-radius': 8,
          'circle-color': '#4CAF50',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });
    }

    // Add end marker if we have a destination
    if (destination) {
      mapRef.current.addSource('end-marker', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: destination
          },
          properties: {}
        }
      });

      mapRef.current.addLayer({
        id: 'end-marker',
        type: 'circle',
        source: 'end-marker',
        paint: {
          'circle-radius': 8,
          'circle-color': '#FF4444',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff'
        }
      });
    }
  };

  const calculatePath = () => {
    if (!mapRef.current || !pathfinderRef.current || !destination) {
      setPathError("Please select a destination");
      return;
    }
    
    console.log("calculating path");
    const start = startLocation ? turf.point(startLocation) : 
                 userLocation ? turf.point(userLocation) : 
                 turf.point([-122.1290835, 37.3615535]); // Default fallback
    const end = turf.point(destination);
    console.log("startLocation", startLocation);
    console.log("userLocation", userLocation);
    console.log("start", start);
    console.log("end", end);
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
      setPathError(null);
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

      // Update markers after successful path calculation
      updateMarkers();
    } else {
      setPathError("No viable path found between the selected locations");
    }
  };

  // Function to update user location marker
  const updateUserLocationMarker = (coordinates: [number, number]) => {
    if (!mapRef.current) return;
    

    // Remove existing user location marker if it exists
    if (mapRef.current.getLayer('user-location')) {
      mapRef.current.removeLayer('user-location');
    }
    if (mapRef.current.getSource('user-location')) {
      mapRef.current.removeSource('user-location');
    }

    // Add new user location marker
    mapRef.current.addSource('user-location', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        properties: {}
      }
    });

    mapRef.current.addLayer({
      id: 'user-location',
      type: 'circle',
      source: 'user-location',
      paint: {
        'circle-radius': 8,
        'circle-color': '#4285F4',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    });
  };

  useEffect(() => {
    if (mapRef.current) {
      return;
    }

    const map = new maplibregl.Map({
      container: mapContainer.current as HTMLDivElement,
      style:
        "https://api.maptiler.com/maps/basic-v2/style.json?key=IB3MIEFaSnwKWw8vcwGF",
      center: [-122.128, 37.3613],
      zoom: 16,
      maxBounds: [
        [-122.136, 37.357],
        [-122.1205, 37.367],
      ],
    });

    mapRef.current = map;

    map.on("load", () => {
      fetch("/foothill.json")
        .then((res) => res.json())
        .then((data) => {
          dataRef.current = data;
          
          // Create pathfinder instance
          const pathfinder = new PathFinder<Feature, FeatureProperties>(data, {
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
          pathfinderRef.current = pathfinder;

          // Add all map layers
          addMapLayers(map, data);
        });
    });

    // Mouse move handler
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

    // Clear on mouse leave
    map.on("mouseleave", () => {
      setHoveredFeature(null);
    });

    return () => map.remove();
  }, []);

  // Effect to request user location
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: [number, number] = [
          position.coords.longitude,
          position.coords.latitude
        ];
        setUserLocation(newLocation);
        updateUserLocationMarker(newLocation);
        setLocationError(null); // Clear any previous errors
      },
      (error) => {
        let errorMessage = "Error getting location: ";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please allow location access in your browser settings";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable. Please check your device's location services";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Please try again";
            break;
          default:
            errorMessage += error.message || "Unknown error";
        }
        setLocationError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000, // Increased timeout to 10 seconds
        maximumAge: 0
      }
    );

    // Also try to get an immediate position fix
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation: [number, number] = [
          position.coords.longitude,
          position.coords.latitude
        ];
        setUserLocation(newLocation);
        updateUserLocationMarker(newLocation);
        setLocationError(null);
      },
      (error) => {
        // Only set error if we don't already have a location from watchPosition
        if (!userLocation) {
          let errorMessage = "Error getting initial location: ";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Please allow location access in your browser settings";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information is unavailable. Please check your device's location services";
              break;
            case error.TIMEOUT:
              errorMessage += "Location request timed out. Please try again";
              break;
            default:
              errorMessage += error.message || "Unknown error";
          }
          setLocationError(errorMessage);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Effect to recalculate path when step-free option changes
  useEffect(() => {
    if (!pathfinderRef.current) return;

    // Update pathfinder weights
    pathfinderRef.current = new PathFinder<Feature, FeatureProperties>(dataRef.current, {
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

      {(locationError || pathError) && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#ff4444",
            color: "white",
            padding: "8px 16px",
            borderRadius: "4px",
            fontSize: "14px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            zIndex: 1000,
          }}
        >
          {locationError}
          {locationError && pathError && <br />}
          {pathError}
        </div>
      )}

      <BottomMenu 
        isStepFree={isStepFree} 
        onStepFreeChange={setIsStepFree}
        onDestinationChange={setDestination}
        onStartLocationChange={setStartLocation}
        onGoClick={() => {
          calculatePath();
          console.log("calculated path");
        }}
      />
    </>
  );
}
