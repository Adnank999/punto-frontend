import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';

import { RouteData } from './Route';
import { useParams } from 'next/navigation';

interface MapProps {
  busCurrentData: any;
  routeData: RouteData;
  selectedRoute: any;
}

const Map = ({ busCurrentData, routeData,selectedRoute }: MapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [buses, setBuses] = useState(busCurrentData.buses);

  
  const params = useParams();
  const busStopId = parseInt(params.id, 10); 

  
  const getNextBusStopTime = (busId: number, busStopId: number) => {
    const busDetails = selectedRoute?.bus_details?.find(
      (busDetail) => busDetail.bus_id === busId
    );

    if (busDetails) {
      const nextStopMovement = busDetails.bus_movement.find(
        (movement) => movement.next_bus_stop_id === busStopId
      );

     
      if (nextStopMovement) {
        return nextStopMovement.actual_time_minutes;
      }
    }

    return 'Not available'; 
  };

  
  const busArrivalTimes = selectedRoute?.bus_details?.map((busDetail) => {
    const arrivalTime = getNextBusStopTime(busDetail.bus_id, busStopId);
    return {
      busId: busDetail.bus_id,
      arrivalTime: arrivalTime,
    };
  });

  const center = {
    lat: buses[0]?.lat,
    lng: buses[0]?.lon,
  };

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const source = {
    lat: buses[0]?.lat,
    lng: buses[0]?.lon,
  };

  const destination = {
    lat: routeData?.latitude,
    lng: routeData?.longitude,
  };

  console.log("routeData",routeData)

  const pathCoordinates = [
    { lat: source?.lat, lng: source?.lng },
    { lat: destination?.lat, lng: destination?.lng },
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setBuses((prevBuses) => {
        return prevBuses.map((bus) => {
          const newLat = bus.lat + (Math.random() * 0.001 - 0.0005);
          const newLon = bus.lon + (Math.random() * 0.001 - 0.0005);
          return {
            ...bus,
            lat: newLat,
            lon: newLon,
          };
        });
      });
    }, 5000); 

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="w-full col-span-5">
      <h1>Route name: {selectedRoute?.route_name}</h1>

     
      {busArrivalTimes && busArrivalTimes.length > 0 ? (
        busArrivalTimes.map((bus) => (
          <p key={bus.busId}>
            Arrival time for Bus {bus.busId}: {bus.arrivalTime} min
          </p>
        ))
      ) : (
        <p>No buses available</p>
      )}

      <div className="border-2 border-black h-[500px]">
        <LoadScript googleMapsApiKey={process.env.GOOGLE_MAP_API_KEY!}>
          <GoogleMap
            mapContainerStyle={{ height: '100%', width: '100%' }}
            center={center}
            zoom={12}
            onLoad={onLoad}
          >
            <Marker position={source} label="Source" />
            <Marker position={destination} label="Destination" />
            <Polyline
              path={pathCoordinates}
              options={{
                strokeColor: '#00008B',
                strokeOpacity: 1,
                strokeWeight: 4,
                geodesic: true,
              }}
            />
            {buses.map((bus, index) => (
              <Marker
                key={index}
                position={{ lat: bus.lat, lng: bus.lon }}
                label={`Bus ${bus.bus_id}`}
              />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default Map;
