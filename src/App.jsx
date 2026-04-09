import React, { useState } from 'react';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import gpxParser from 'gpxparser';
import 'leaflet/dist/leaflet.css';

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

function App() {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  
  // Koordinat default awal (Purwokerto)
  const defaultCenter = [-7.4245, 109.2302]; 

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const gpxText = e.target.result;
      
      const gpx = new gpxParser();
      gpx.parse(gpxText);

      if (gpx.tracks.length > 0) {
        const points = gpx.tracks[0].points;
        
        // Leaflet butuh format koordinat berupa array [latitude, longitude]
        const coordinates = points.map(p => [p.lat, p.lon]);
        
        setRouteCoordinates(coordinates);
        console.log("Berhasil mengekstrak", coordinates.length, "titik koordinat");
      } else {
        alert("Tidak ada data rute (track) yang ditemukan di file ini.");
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        
        <div className="bg-blue-600 p-6 text-white">
          <h1 className="text-3xl font-bold">GPX Fitness Tracker</h1>
          <p className="mt-2 text-blue-100">Analisis rute olahraga dan datamu secara lokal.</p>
        </div>

        <div className="p-6">
          <div className="mb-6 p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center transition-colors hover:border-blue-400">
            <p className="text-gray-600 mb-4 font-medium">Upload file .gpx kamu di sini</p>
            {/* Tambahkan onChange untuk memanggil fungsi handleFileUpload */}
            <input 
              type="file" 
              accept=".gpx" 
              onChange={handleFileUpload}
              className="block w-full max-w-sm text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" 
            />
          </div>

          <h2 className="text-xl font-bold text-gray-800 mb-4">Peta Rute</h2>
          <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-inner relative z-0">
            <MapContainer center={defaultCenter} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 10 }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {/* Jika routeCoordinates ada isinya, gambar garis berwarna merah */}
              {routeCoordinates.length > 0 && (
                <Polyline positions={routeCoordinates} color="red" weight={4} />
              )}
            </MapContainer>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default App;