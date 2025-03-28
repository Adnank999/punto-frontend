"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";



interface BusStop {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}


const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const toRad = (value: number) => value * (Math.PI / 180);
  const R = 6371; // Earth radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [closestBusStop, setClosestBusStop] = useState<BusStop | null>(null);

  const handleUseLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchBusStops(latitude, longitude);
        },
        (error) => {
          setLocationError("Unable to retrieve your location.");
          setLoading(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setLoading(false);
    }
  };

  const fetchBusStops = async (userLat: number, userLon: number) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/bus-stops`
      );

      
  

      const busStops: BusStop[] = response.data.data; 
      
      if (Array.isArray(busStops)) {
        let closestStop: BusStop | null = null;
        let minDistance = Infinity;

        busStops.forEach((stop) => {
          const distance = getDistance(
            userLat,
            userLon,
            stop.latitude,
            stop.longitude
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestStop = stop;
          }
        });

        setLoading(false);
        setClosestBusStop(closestStop);
      } else {
        setLocationError(
          "Invalid data format. Expected an array of bus stops."
        );
        setLoading(false);
      }
    } catch (error) {
      console.error(error); 
      setLoading(false);
      setLocationError("Failed to fetch bus stops.");
    }
  };

  const router = useRouter();

  const handleRoute = () => {
    if (closestBusStop) {
     
      router.push(`/routes/${closestBusStop.id}`); 
    }
  };

 
  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="mt-10 text-3xl font-bold">Select your stop</h1>
      <div className="flex flex-col justify-center items-center h-screen space-y-4">
        <div className="flex flex-col justify-center items-center space-y-4">
          <button className="bg-blue-600 px-4 py-2 rounded-md">
            Write Code
          </button>
          <button className="bg-blue-600 px-4 py-2 rounded-md">
            Scan QR Code
          </button>
          <button
            onClick={handleUseLocation}
            className="bg-blue-600 px-4 py-2 rounded-md"
          >
            Use my Location
          </button>
        </div>

        {loading && <p>Loading...</p>}
        {locationError && <p>{locationError}</p>}

        {closestBusStop && (
          <div>
            <button
              onClick={handleRoute}
              className="bg-blue-600 px-4 py-2 rounded-md"
            >
              Choose that {closestBusStop.name}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
