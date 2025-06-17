"use client"; // For Next.js 13+ app router, or ignore if using pages router

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import PathFinder from "geojson-path-finder";
import * as turf from "@turf/turf";
import { addMapLayers } from "./mapLayers";
import BottomMenu from "./components/BottomMenu";
import { Feature, FeatureCollection, GeoJsonProperties, Geometry, LineString, Position } from "geojson";
import { Path } from "geojson-path-finder/dist/esm/types";
import { Location, locations } from "./locations"

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
  const [destination, setDestination] = useState<[number, number] | [number, number][] | null>(null);
  const [destinationRef, setDestinationRef] = useState<Location | null>(null);
  const [startLocation, setStartLocation] = useState<[number, number] | [number, number][] | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [pathError, setPathError] = useState<string | null>(null);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const currentPopupRef = useRef<maplibregl.Popup | null>(null);
  const [selectedDestination, setSelectedDestination] = useState('');
  const [selectedStart, setSelectedStart] = useState('Current Location');

  // Function to update markers
  const updateMarkers = (start: [number, number] | null, end: [number, number] | null) => {
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
    
    if (start) {
      mapRef.current.addSource('start-marker', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: start
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
    if (end) {
      mapRef.current.addSource('end-marker', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: end
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
    if (!mapRef.current || !pathfinderRef.current || !destination || (!startLocation && !userLocation)) {
      setPathError("Please select a destination");
      return;
    }
    
    console.log("calculating path");

    // Remove existing route layer if it exists
    if (mapRef.current.getLayer('route-line')) {
      mapRef.current.removeLayer('route-line');
    }
    if (mapRef.current.getSource('route')) {
      mapRef.current.removeSource('route');
    }

    // Remove existing popup if it exists
    if (currentPopupRef.current) {
      currentPopupRef.current.remove();
      currentPopupRef.current = null;
    }

    // Get all line features from the data
    const lineFeatures = dataRef.current?.features.filter(
      feature => feature.geometry.type === 'LineString'
    ) as Feature<LineString>[] || [];
    
    let endList: [number, number][] = []
    let startList: [number, number][] = []

    if(destination.length == 0) {
      //TODO: raise error of some kind
    } else if (typeof destination[0] == 'number') {
      endList = [destination as [number, number]]
    } else {
      endList = destination as [number, number][]
    }

    if (startLocation == null) {
      //snap user location

      let minDist = Infinity;
      let snappedUserLoc: [number, number] | null = null;

      for (const feature of lineFeatures) {
        if (feature.geometry.type != "LineString" || feature.properties?.waterway == "stream"){
          continue
        }

        const line = feature.geometry;

        for(const position of line.coordinates) {
          const dist = turf.distance(position, userLocation as [number, number])
          if(dist < minDist) {
            minDist = dist
            snappedUserLoc = position as [number, number]
          }
        }
      }

      console.log("snapped ", userLocation, " to ", snappedUserLoc)

      startList = [snappedUserLoc as [number, number]]
    } else if(startLocation.length == 0) {
      //TODO: raise error of some kind
    } else if (typeof startLocation[0] == 'number') {
      startList = [startLocation as [number, number]]
    } else {
      startList = startLocation as [number, number][]
    }

    let path: Path<Feature<Geometry, GeoJsonProperties>> | undefined;
    let startPoint: [number, number] | null = null;
    let endPoint: [number, number] | null = null;

    let bestLength = Infinity;

    for(const start of startList) {
      for(const end of endList) {
        const new_path = pathfinderRef.current.findPath(
          turf.point(start),
          turf.point(end)
        );
        if(new_path != undefined && (path == undefined || new_path.weight < bestLength)) {
          path = new_path
          bestLength = new_path.weight
          startPoint = start
          endPoint = end
        }
      }
    }

    // Add new route
    if (path) {
      setPathError(null);

      // Remove existing highlight layer if it exists
      if (mapRef.current.getLayer('destination-highlight')) {
        mapRef.current.removeLayer('destination-highlight');
      }
      if (mapRef.current.getSource('destination-highlight')) {
        mapRef.current.removeSource('destination-highlight');
      }

      if (destinationRef && destinationRef.highlightable != false) {
        console.log("features:", dataRef.current?.features)
        const destinationBuilding = dataRef.current?.features.find(feature => 
          feature.properties?.name == destinationRef.name
        );

        console.log("feature:", destinationBuilding)

        if (destinationBuilding) {
          mapRef.current.addSource('destination-highlight', {
            type: 'geojson',
            data: destinationBuilding
          });

          mapRef.current.addLayer({
            id: 'destination-highlight',
            type: 'fill',
            source: 'destination-highlight',
            paint: {
              'fill-color': '#ffd700',
              'fill-opacity': 0.5,
              'fill-outline-color': '#ffd700'
            }
          });
        }
      }

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
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          'line-color': '#ffff00',
          'line-width': 8,
          'line-opacity': 0.7
        }
      });

      // Calculate and display time
      const seconds = Math.round(path.weight / 1.3);
      const minutes = Math.round(seconds / 60);
      const timeString = minutes > 0 
        ? `${minutes} minute${minutes > 1 ? 's' : ''}`
        : `${Math.round(seconds/10)*10} seconds`;

      // Add popup at the start of the route
      const popup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 25
      });

      popup.setLngLat(path.path[0] as [number, number])
        .setHTML(`<div style="font-size: 18px; font-weight: 500; color: black;">${timeString}</div>`)
        .addTo(mapRef.current);

      // Store the popup reference
      currentPopupRef.current = popup;

      // Fit map to route bounds
      const bounds = path.path.reduce((bounds, coord) => {
        return bounds.extend(coord as [number, number]);
      }, new maplibregl.LngLatBounds(path.path[0] as [number, number], path.path[0] as [number, number]));

      mapRef.current.fitBounds(bounds, {
        padding: 100,
        maxZoom: 18,
        duration: 1000
      });
    } else {
      setPathError("No viable path found between the selected locations");
    }
    updateMarkers(startPoint, endPoint);
  };

  // Function to update user location marker
  const updateUserLocationMarker = (coordinates: [number, number]) => {
    if (!mapRef.current) return;
    if (!mapRef.current.isStyleLoaded()) {
      mapRef.current.on("load", () => {updateUserLocationMarker(coordinates)});
      return
    }

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
            weight: (a: Position, b: Position, properties: FeatureProperties) => {
              const distance = turf.distance(a, b, {units: "meters"})
      
              if (properties.waterway == "stream") {
                return undefined
              }
              else if (properties.highway === "steps") {
                return (isStepFree ? 1000 : 1.5) * distance;
              }
              else if (properties.highway === "footway" || properties.highway === "path" || properties.foot === "yes") {
                return distance;
              }
              else if (properties.elevator === "yes") {
                return 30;
              }
              return 2 * distance;
            }
          });
          pathfinderRef.current = pathfinder;

          // Add all map layers
          addMapLayers(map, data);
        });
    });

    // Add click handler
    map.on("click", (e) => {
      const lineFeatures = dataRef.current?.features.filter(
        feature => feature.geometry.type === 'LineString'
      ) as Feature<LineString>[] || [];

      let minDist = Infinity;
      let snappedLoc: [number, number] | null = null;

      for (const feature of lineFeatures) {
        if (feature.geometry.type != "LineString" || feature.properties?.waterway == "stream"){
          continue
        }

        const line = feature.geometry;

        for(const position of line.coordinates) {
          const dist = turf.distance(position, [e.lngLat.lng, e.lngLat.lat])
          if(dist < minDist) {
            minDist = dist
            snappedLoc = position as [number, number]
          }
        }
      }

      console.log("snapped ", [e.lngLat.lng, e.lngLat.lat], " to ", snappedLoc)
      if(snappedLoc) 
        navigator.clipboard.writeText("[" + snappedLoc[0] + ", " + snappedLoc[1] + "]")
    });

    // Add click handler
    map.on("click", (e) => {
      // Check if we clicked on a building that matches a location
      const clickedFeatures = map.queryRenderedFeatures(e.point);
      const clickedBuilding = clickedFeatures.find(feature =>  
        locations.find(loc => loc.name == feature.properties?.name)
      );

      console.log("b",clickedBuilding)

      if (clickedBuilding) {
        // Find matching location
        const matchingLocation = locations.find(loc => loc.name == clickedBuilding.properties.name);
        if (matchingLocation) {
          setDestination(matchingLocation.coordinates);
          setSelectedDestination(matchingLocation.name)
          setDestinationRef(matchingLocation);
          setIsMenuExpanded(true);
        }
      }
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
      weight: (a: Position, b: Position, properties: FeatureProperties) => {
        const distance = turf.distance(a, b, {units: "meters"})

        if (properties.waterway == "stream") {
          return undefined
        }
        else if (properties.highway === "steps") {
          return (isStepFree ? 1000 : 1.5) * distance;
        }
        else if (properties.highway === "footway" || properties.highway === "path" || properties.foot === "yes") {
          return distance;
        }
        else if (properties.elevator === "yes") {
          return 30
        }
        return 2 * distance;
      }
    });
  }, [isStepFree]);

  return (
    <>
      <div
        ref={mapContainer}
        style={{
          width: "100%",
          height: isMenuExpanded ? "50vh" : "calc(100vh - 60px)",
          position: "relative",
          transition: "height 0.3s ease-in-out"
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
        onDestinationRefChange={setDestinationRef}
        onStartLocationChange={setStartLocation}
        onGoClick={() => {
          calculatePath();
          console.log("calculated path");
        }}
        isMenuExpanded={isMenuExpanded}
        onIsMenuExpandedChange={setIsMenuExpanded}
        selectedDestination={selectedDestination}
        onSelectedDestinationChange={setSelectedDestination}
        selectedStart={selectedStart}
        onSelectedStartChange={setSelectedStart}
      />
    </>
  );
}
