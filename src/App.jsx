import React, { useState, useRef } from 'react';
import gpxParser from 'gpxparser';
import 'leaflet/dist/leaflet.css';

import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import MapArea from './components/MapArea';

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

function App() {
  const fileInputRef = useRef(null);
  
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [waypointsList, setWaypointsList] = useState([]);
  const [elevationChartData, setElevationChartData] = useState(null);
  const [trackSummary, setTrackSummary] = useState({
    fileName: 'Belum ada file', distance: '0.0', duration: '-',
    elevGain: '0', avgSpeed: '0.0', maxElev: '0', waypointsCount: '0'
  });

  // --- LOGIKA BARU: Fungsi inti untuk membaca file ---
  const processFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const gpxText = e.target.result;
      const gpx = new gpxParser();
      gpx.parse(gpxText);

      if (gpx.tracks.length > 0) {
        const track = gpx.tracks[0];
        const points = track.points;
        const coordinates = points.map(p => [p.lat, p.lon]);
        
        const distanceKm = (track.distance.total / 1000).toFixed(2);
        const elevGain = track.elevation.pos ? Math.round(track.elevation.pos) : 0;
        const maxElev = track.elevation.max ? Math.round(track.elevation.max) : 0;

        let durationStr = "-";
        let avgSpeedStr = "-";
        if (points.length > 0 && points[0].time && points[points.length - 1].time) {
          const startTime = new Date(points[0].time).getTime();
          const endTime = new Date(points[points.length - 1].time).getTime();
          const durationMs = endTime - startTime;
          if (durationMs > 0) {
            const hours = Math.floor(durationMs / (1000 * 60 * 60));
            const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
            durationStr = `${hours}h ${minutes}m`;
            const durationHours = durationMs / (1000 * 60 * 60);
            avgSpeedStr = (distanceKm / durationHours).toFixed(1);
          }
        }

        const wpCount = gpx.waypoints ? gpx.waypoints.length : 0;
        const parsedWaypoints = gpx.waypoints ? gpx.waypoints.map((wp, index) => ({
          id: index, name: wp.name || `Titik Koordinat ${index + 1}`,
          color: ['#1D9E75', '#5DCAA5', '#EF9F27', '#D85A30'][index % 4] 
        })) : [];

        const validElevationPoints = points.filter(p => p.ele !== null && p.ele !== undefined);
        const elevations = validElevationPoints.map(p => p.ele);
        const chartLabels = validElevationPoints.map((_, i) => i); 

        if (elevations.length > 0) {
          setElevationChartData({
            labels: chartLabels,
            datasets: [{
              fill: true, data: elevations, borderColor: '#1D9E75',
              backgroundColor: 'rgba(29, 158, 117, 0.15)', borderWidth: 1.5,
              pointRadius: 0, tension: 0.3 
            }]
          });
        } else {
          setElevationChartData(null); 
        }

        setTrackSummary({
          fileName: file.name, distance: distanceKm, duration: durationStr,
          elevGain: elevGain, avgSpeed: avgSpeedStr, maxElev: maxElev, waypointsCount: wpCount
        });
        setWaypointsList(parsedWaypoints);
        setRouteCoordinates(coordinates);
      } else {
        alert("Tidak ada data rute (track) yang ditemukan di file ini.");
      }
    };
    reader.readAsText(file);
  };

  // Handler untuk klik tombol
  const handleFileUpload = (event) => {
    processFile(event.target.files[0]);
  };

  // Handler untuk area Drag & Drop
  const handleDrop = (event) => {
    event.preventDefault(); // Wajib agar browser tidak membuka file di tab baru
    const droppedFile = event.dataTransfer.files[0];
    processFile(droppedFile);
  };

  const triggerFileUpload = () => fileInputRef.current.click();

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8 font-sans">
      <div className="max-w-[1280px] mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 flex flex-col">
        
        <Topbar fileName={trackSummary.fileName} triggerFileUpload={triggerFileUpload} />
        <input type="file" accept=".gpx" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />

        <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] h-[640px]">
          <Sidebar 
            triggerFileUpload={triggerFileUpload} 
            handleDrop={handleDrop} // Kirim fungsi drop ke Sidebar
            trackSummary={trackSummary} 
            elevationChartData={elevationChartData} 
            waypointsList={waypointsList}
            isDataLoaded={routeCoordinates.length > 0}
          />
          <MapArea 
            routeCoordinates={routeCoordinates} 
            fileName={trackSummary.fileName} 
            distance={trackSummary.distance} 
          />
        </div>
      </div>
    </div>
  );
}

export default App;