'use client'
import React, { useEffect, useState } from "react";
import Map from "./Map";

const postData = {
  buses: [
    {
      bus_id: 7,
      lat: 23.810101,
      lon: 90.412401,
    },
    {
      bus_id: 10,
      lat: 40.495689,
      lon: -73.747883,
    },
  ],
};

export interface RouteData {
  bus_stop: string;
  latitude: number;
  longitude: number;
  total_routes: number;
  routes: Route[];
}

export interface Route {
  route_id: number;
  route_name: string;
  bus_details: BusDetail[];
}

export interface BusDetail {
  bus_id: number;
  bus_movement: BusMovement[];
}

export interface BusMovement {
  bus_stop_id: number;
  next_bus_stop_id?: number;
  distance_to_current_stop: number;
  in_geofence_radius: boolean;
  recent_bus_stop_match: boolean;
  predefined_time_to_next_stop?: number;
  actual_time_seconds: number;
  actual_time_minutes: number;
}

const Route = ({ id }: any) => {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null); 

  useEffect(() => {
    const getRouteData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/bus-stops/${id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(postData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch route details");
        }

        const data = await response.json();
        setRouteData(data); 
      } catch (error) {
        console.error("Error fetching route details:", error);
      }
    };

    getRouteData();
  }, [id]);

  // Handle route selection
  const handleRouteClick = (route: Route) => {
    setSelectedRoute(route); 
  };

  console.log("parent component rendered");

  return (
    <div>
      <h1 className="text-center mt-6 text-4xl">You are in Bus Stop {routeData?.bus_stop}</h1>
      <div className="grid grid-cols-6 max-w-5xl mx-auto gap-4 mt-10">
        <div className="col-span-1 border border-black mt-5 rounded-lg p-4">
          <h1>Select your route</h1>
          <p>(All routes go to this station)</p>
          <div className="bg-blue-500 px-4 py-1 rounded-md mt-4 text-center">
            {routeData?.routes.map((route) => (
              <div
                key={route.route_id}
                onClick={() => handleRouteClick(route)} 
                className="cursor-pointer hover:bg-blue-700 rounded-md py-2 px-4"
              >
                <h2>{route.route_name}</h2>
              </div>
            ))}
          </div>
        </div>

      
        {selectedRoute && <Map busCurrentData={postData} routeData={routeData} selectedRoute={selectedRoute}/>}
      </div>
    </div>
  );
};

export default Route;
