"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIconPng from "leaflet/dist/images/marker-icon.png";
import markerShadowPng from "leaflet/dist/images/marker-shadow.png";

// Custom Red Marker
const customIcon = new L.Icon({
    iconUrl: markerIconPng,  // Corrected marker icon
    shadowUrl: markerShadowPng, // Fix missing shadow
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

// Component to Recenter Map when user location updates
function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

// Function to calculate distance (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export default function RidePage() {
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [sourceCoords, setSourceCoords] = useState<[number, number] | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
  const [suggestions, setSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<{ display_name: string; lat: string; lon: string }[]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [fare, setFare] = useState<{ uber: number; ola: number; rapido: number } | null>(null);

  useEffect(() => {
    if (useCurrentLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latLng: [number, number] = [position.coords.latitude, position.coords.longitude];
          setUserLocation(latLng);
          setSourceCoords(latLng);
          setSource(`Lat: ${latLng[0]}, Lng: ${latLng[1]}`);
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true }
      );
    }
  }, [useCurrentLocation]);

  // Fetch location suggestions from Nominatim API
  const fetchSuggestions = async (query: string, type: "source" | "destination") => {
    if (!query) {
      if (type === "source") setSuggestions([]);
      else setDestinationSuggestions([]);
      return;
    }
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
    const data = await response.json();
    if (type === "source") setSuggestions(data);
    else setDestinationSuggestions(data);
  };

  // Fetch Coordinates for Selected Address
  const fetchCoordinates = async (query: string, type: "source" | "destination") => {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
    const data = await response.json();
    if (data.length > 0) {
      const coords: [number, number] = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      if (type === "source") {
        setSourceCoords(coords);
      } else {
        setDestinationCoords(coords);
      }
    }
  };

  // Calculate Distance & Fare
  const calculateFare = () => {
    if (!sourceCoords || !destinationCoords) return;

    const dist = calculateDistance(sourceCoords[0], sourceCoords[1], destinationCoords[0], destinationCoords[1]);
    setDistance(dist);

    // Fare Calculation (Sample Pricing per KM)
    const fareRates = {
      uber: 10, // ₹10 per km
      ola: 12,  // ₹12 per km
      rapido: 8 // ₹8 per km
    };

    setFare({
      uber: dist * fareRates.uber,
      ola: dist * fareRates.ola,
      rapido: dist * fareRates.rapido
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Uber-Like Ride Estimator (Free Version)</h1>

      {/* Toggle for using current location */}
      <label className="flex items-center mb-2">
        <input
          type="checkbox"
          checked={useCurrentLocation}
          onChange={() => setUseCurrentLocation(!useCurrentLocation)}
          className="mr-2"
        />
        Use Current Location as Start Point
      </label>

      {/* Source Input */}
      {!useCurrentLocation && (
        <input
          type="text"
          placeholder="Enter Source"
          value={source}
          onChange={(e) => {
            setSource(e.target.value);
            fetchSuggestions(e.target.value, "source");
          }}
          onBlur={() => fetchCoordinates(source, "source")}
          className="border p-2 mb-2 w-full"
        />
      )}

      {/* Destination Input */}
      <input
        type="text"
        placeholder="Enter Destination"
        value={destination}
        onChange={(e) => {
          setDestination(e.target.value);
          fetchSuggestions(e.target.value, "destination");
        }}
        onBlur={() => fetchCoordinates(destination, "destination")}
        className="border p-2 mb-4 w-full"
      />

      {/* Calculate Button */}
      <button onClick={calculateFare} className="bg-blue-500 text-white px-4 py-2 rounded">
        Calculate Fare
      </button>

      {/* Distance & Fare Display */}
      {distance !== null && fare && (
        <div className="mt-4 p-4 border rounded">
          <p>Distance: {distance.toFixed(2)} km</p>
          <p>Uber Fare: ₹{fare.uber.toFixed(2)}</p>
          <p>Ola Fare: ₹{fare.ola.toFixed(2)}</p>
          <p>Rapido Fare: ₹{fare.rapido.toFixed(2)}</p>
        </div>
      )}

      {/* Map Section */}
      <MapContainer
        center={userLocation || [20.5937, 78.9629]}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {userLocation && (
          <>
            <Marker position={userLocation} icon={customIcon} />
            <RecenterMap center={userLocation} />
          </>
        )}
        {destinationCoords && <Marker position={destinationCoords} icon={customIcon} />}
      </MapContainer>
    </div>
  );
}

