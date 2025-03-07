"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Driver Icon
const driverIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [30, 45],
  iconAnchor: [15, 45],
});

// Function to center the map on the driver
function MapUpdater({ driverLocation }: { driverLocation: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (driverLocation) {
      map.setView(driverLocation, 15);
    }
  }, [driverLocation, map]);
  return null;
}

// Calculate distance between two points (Haversine Formula)
const calculateDistance = ([lat1, lon1]: [number, number], [lat2, lon2]: [number, number]) => {
  const R = 6371; // Radius of the Earth in km
  const toRad = (angle: number) => (angle * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function DriverPage() {
  const [driverLocation, setDriverLocation] = useState<[number, number] | null>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [availableRides, setAvailableRides] = useState<
    { id: number; source: [number, number]; destination: [number, number]; distance: number; fare: number }[]
  >([]);
  const [acceptedRide, setAcceptedRide] = useState<{
    id: number;
    source: [number, number];
    destination: [number, number];
    distance: number;
    fare: number;
  } | null>(null);
  const [earnings, setEarnings] = useState(0);
  const [rideHistory, setRideHistory] = useState<{ id: number; source: string; destination: string; fare: number }[]>(
    []
  );

  // Fetch Driver's Location
  useEffect(() => {
    if (navigator.geolocation) {
      const watcher = navigator.geolocation.watchPosition(
        (position) => {
          setDriverLocation([position.coords.latitude, position.coords.longitude]);
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
      return () => navigator.geolocation.clearWatch(watcher);
    }
  }, []);

  // Toggle Driver Online Status
  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
    if (!isOnline) {
      fetchAvailableRides();
    } else {
      setAvailableRides([]);
      setAcceptedRide(null);
    }
  };

  // Fetch Available Rides with Distance & Fare Calculation
  const fetchAvailableRides = () => {
    if (!driverLocation) return;
    const rides = [
      { id: 1, source: [20.5937, 78.9629], destination: [20.6000, 78.9700] },
      { id: 2, source: [20.6050, 78.9750], destination: [20.6100, 78.9800] },
    ].map((ride) => {
      const distance = calculateDistance(driverLocation, ride.source);
      return {
        ...ride,
        distance: parseFloat(distance.toFixed(2)),
        fare: Math.round(distance * 20),
      };
    });

    setAvailableRides(rides);
  };

  // Accept Ride
  const acceptRide = (ride: {
    id: number;
    source: [number, number];
    destination: [number, number];
    distance: number;
    fare: number;
  }) => {
    setAcceptedRide(ride);
    setAvailableRides([]);
  };

  // Complete Ride
  const completeRide = () => {
    if (acceptedRide) {
      setEarnings(earnings + acceptedRide.fare);
      setRideHistory([
        ...rideHistory,
        { id: acceptedRide.id, source: "Start Point", destination: "End Point", fare: acceptedRide.fare },
      ]);
      setAcceptedRide(null);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🚖 Driver Dashboard</h1>

      {/* Toggle Online/Offline */}
      <button
        onClick={toggleOnlineStatus}
        className={`px-4 py-2 rounded mb-4 font-semibold ${isOnline ? "bg-red-500" : "bg-green-500"} text-white`}
      >
        {isOnline ? "🔴 Go Offline" : "🟢 Go Online"}
      </button>

      {/* Available Rides */}
      {isOnline && !acceptedRide && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">📌 Available Rides</h2>
          {availableRides.length === 0 ? (
            <p>No rides available</p>
          ) : (
            availableRides.map((ride) => (
              <div key={ride.id} className="border p-2 rounded my-2 flex justify-between bg-gray-100 shadow-md">
                <div>
                  <p><strong>🚀 Source:</strong> {ride.source.join(", ")}</p>
                  <p><strong>🏁 Destination:</strong> {ride.destination.join(", ")}</p>
                  <p><strong>📏 Distance:</strong> {ride.distance} km</p>
                  <p><strong>💰 Estimated Fare:</strong> ₹{ride.fare}</p>
                </div>
                <button onClick={() => acceptRide(ride)} className="bg-blue-500 text-white px-4 py-2 rounded">
                  Accept
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Accepted Ride */}
      {acceptedRide && (
        <div className="border p-4 rounded mb-4 bg-green-100 shadow-md">
          <h2 className="text-xl font-semibold">🛣 Accepted Ride</h2>
          <p><strong>🚀 Source:</strong> {acceptedRide.source.join(", ")}</p>
          <p><strong>🏁 Destination:</strong> {acceptedRide.destination.join(", ")}</p>
          <p><strong>📏 Distance:</strong> {acceptedRide.distance} km</p>
          <p><strong>💰 Fare:</strong> ₹{acceptedRide.fare}</p>
          <button onClick={completeRide} className="bg-green-500 text-white px-4 py-2 rounded mt-2">
            ✅ Complete Ride
          </button>
        </div>
      )}

      {/* Earnings */}
      <h2 className="text-xl font-semibold">💵 Earnings: ₹{earnings}</h2>

      {/* Map */}
      <MapContainer center={driverLocation || [20.5937, 78.9629]} zoom={13} style={{ height: "400px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapUpdater driverLocation={driverLocation} />
        {driverLocation && <Marker position={driverLocation} icon={driverIcon} />}
        {acceptedRide && <Polyline positions={[acceptedRide.source, acceptedRide.destination]} color="blue" />}
      </MapContainer>
    </div>
  );
}
