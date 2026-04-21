import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Komponen internal: tugasnya hanya memperbarui viewport peta saat rute berubah.
// Ia harus berada DI DALAM <MapContainer> agar punya akses ke konteks peta via useMap().
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

// Legenda warna kecepatan — agar pengguna tahu arti tiap warna di peta.
const SPEED_LEGEND = [
  { color: '#94a3b8', label: '< 4', unit: 'km/h' },
  { color: '#3b82f6', label: '4–7', unit: 'km/h' },
  { color: '#22c55e', label: '7–10', unit: 'km/h' },
  { color: '#f97316', label: '10–14', unit: 'km/h' },
  { color: '#ef4444', label: '> 14', unit: 'km/h' },
];

export default function MapArea({ routeCoordinates, speedSegments, waypointsList, fileName, distance }) {
  const defaultCenter = [-7.4245, 109.2302];

  // State untuk toggle antara "rute biasa" dan "heatmap kecepatan"
  const [showSpeedMap, setShowSpeedMap] = useState(false);

  // Jika ada data segmen kecepatan, tampilkan tombol toggle
  const canShowSpeedMap = speedSegments && speedSegments.length > 0;

  // Custom icon untuk waypoint
  const createWaypointIcon = (color) =>
    L.divIcon({
      html: `<div style="width:24px;height:24px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 2px 4px rgba(0,0,0,0.3)"></div>`,
      iconSize: [24, 24],
      className: 'waypoint-icon',
    });

  return (
    <div className="relative bg-slate-100 overflow-hidden border-l border-slate-200">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%', position: 'absolute', top: 0, left: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater coordinates={routeCoordinates} />

        {/* Mode 1: Rute biasa — satu warna hijau */}
        {!showSpeedMap && routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color="#1D9E75"
            weight={5}
            opacity={0.85}
          />
        )}

        {/* Mode 2: Heatmap kecepatan — banyak segmen berwarna */}
        {showSpeedMap && speedSegments.map((seg, index) => (
          <Polyline
            key={index}
            positions={seg.positions}
            color={seg.color}
            weight={5}
            opacity={0.85}
          />
        ))}

        {/* Waypoints sebagai markers */}
        {waypointsList && waypointsList.length > 0 && waypointsList.map((wp) => (
          <Marker
            key={wp.id}
            position={[wp.lat, wp.lon]}
            icon={createWaypointIcon(wp.color)}
          >
            <Popup>{wp.name}</Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Tombol toggle mode peta — hanya muncul jika ada data waktu */}
      {canShowSpeedMap && (
        <button
          onClick={() => setShowSpeedMap((prev) => !prev)}
          className="absolute top-3 right-3 z-20 bg-white border border-slate-200 shadow-sm rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
        >
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ background: showSpeedMap ? 'linear-gradient(to right, #3b82f6, #22c55e, #ef4444)' : '#1D9E75' }}
          />
          {showSpeedMap ? 'Mode: Kecepatan' : 'Mode: Normal'}
        </button>
      )}

      {/* Legenda kecepatan — muncul saat mode heatmap aktif */}
      {showSpeedMap && (
        <div className="absolute top-12 right-3 z-20 bg-white border border-slate-200 shadow-sm rounded-lg p-2.5 flex flex-col gap-1.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Kecepatan</p>
          {SPEED_LEGEND.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-slate-700">{item.label} <span className="text-slate-400">{item.unit}</span></span>
            </div>
          ))}
        </div>
      )}

      {/* Info badge nama file & jarak */}
      {routeCoordinates.length > 0 && (
        <div className="absolute bottom-4 left-4 z-20 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full bg-green-600" />
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
