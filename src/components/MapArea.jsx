import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

function MapUpdater({ coordinates }) {
  const map = useMap(); 
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates);
      map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
    }
  }, [coordinates, map]); 
  return null; 
}

export default function MapArea({ routeCoordinates, fileName, distance }) {
  const defaultCenter = [-7.4245, 109.2302]; 

  return (
    <div className="relative bg-slate-100 overflow-hidden flex items-center justify-center border-l border-slate-200">
      <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 10 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater coordinates={routeCoordinates} />
        {routeCoordinates.length > 0 && (
          <Polyline positions={routeCoordinates} color="#1D9E75" weight={5} opacity={0.8} />
        )}
      </MapContainer>

      {routeCoordinates.length > 0 && (
        <div className="absolute bottom-4 left-4 z-20 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-600"></div>
          <span className="text-slate-900 font-medium truncate max-w-[150px]">{fileName}</span>
          <span className="text-xs text-slate-500 ml-1">{distance} km</span>
        </div>
      )}
      
      <div className="absolute bottom-2 right-2 z-20 text-[10px] text-slate-600 bg-white/75 px-1.5 py-0.5 rounded">
        © OpenStreetMap contributors
      </div>
    </div>
  );
}