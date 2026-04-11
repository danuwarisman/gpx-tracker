import React, { useState, useRef } from 'react';
import gpxParser from 'gpxparser';
import 'leaflet/dist/leaflet.css';

import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import MapArea from './components/MapArea';

import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, BarController, Tooltip, Filler,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, BarController, Tooltip, Filler);

// -------------------------------------------------------------------
// HELPER: Menghitung jarak antara dua koordinat (Haversine Formula)
// Mengembalikan jarak dalam kilometer.
// -------------------------------------------------------------------
function haversineDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius bumi dalam km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// -------------------------------------------------------------------
// HELPER: Menentukan warna segmen berdasarkan kecepatan (km/h)
// Skema warna dirancang seperti "heatmap" yang intuitif bagi pelari.
// -------------------------------------------------------------------
function getSpeedColor(speedKmh) {
  if (speedKmh < 4)  return '#94a3b8'; // Slate  → Jalan kaki
  if (speedKmh < 7)  return '#3b82f6'; // Biru   → Jogging ringan
  if (speedKmh < 10) return '#22c55e'; // Hijau  → Lari normal
  if (speedKmh < 14) return '#f97316'; // Oranye → Lari cepat
  return '#ef4444';                     // Merah  → Sprint
}

// -------------------------------------------------------------------
// HELPER: Membangun data chart distribusi elevasi
// Menghitung berapa banyak titik GPS berada di setiap "band" ketinggian.
// -------------------------------------------------------------------
function buildElevationDistributionData(elevations) {
  if (!elevations || elevations.length === 0) return null;

  const minElev = Math.floor(Math.min(...elevations));
  const maxElev = Math.ceil(Math.max(...elevations));
  const range = maxElev - minElev;
  if (range < 1) return null;

  const BAND_COUNT = 10;
  const bandSize = range / BAND_COUNT;

  // Inisialisasi array penghitung untuk setiap band
  const counts = new Array(BAND_COUNT).fill(0);
  elevations.forEach((elev) => {
    const bandIndex = Math.min(Math.floor((elev - minElev) / bandSize), BAND_COUNT - 1);
    counts[bandIndex]++;
  });

  const labels = counts.map((_, i) => `${Math.round(minElev + i * bandSize)}m`);

  return {
    labels,
    datasets: [{
      data: counts,
      backgroundColor: 'rgba(29, 158, 117, 0.6)',
      borderColor: '#1D9E75',
      borderWidth: 1,
      borderRadius: 3,
    }],
  };
}

function App() {
  const fileInputRef = useRef(null);

  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [speedSegments, setSpeedSegments] = useState([]);       // BARU: untuk peta warna kecepatan
  const [waypointsList, setWaypointsList] = useState([]);
  const [elevationChartData, setElevationChartData] = useState(null);
  const [elevationDistributionData, setElevationDistributionData] = useState(null); // BARU
  const [trackSummary, setTrackSummary] = useState({
    fileName: 'Belum ada file', distance: '0.0', duration: '-',
    elevGain: '0', avgSpeed: '0.0', maxElev: '0', waypointsCount: '0',
    avgPace: '-',     // BARU: format "mm:ss /km"
    calories: '0',    // BARU: estimasi kkal
  });

  const processFile = (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const gpxText = e.target.result;
        const gpx = new gpxParser();
        gpx.parse(gpxText);

        if (gpx.tracks.length === 0) {
          alert("Tidak ada data rute (track) yang ditemukan di file ini.");
          return;
        }

        const track = gpx.tracks[0];
        const points = track.points;
        const coordinates = points.map((p) => [p.lat, p.lon]);

        const distanceKm = (track.distance.total / 1000).toFixed(2);
        const elevGain = track.elevation.pos ? Math.round(track.elevation.pos) : 0;
        const maxElev = track.elevation.max ? Math.round(track.elevation.max) : 0;

        // --- Kalkulasi berbasis waktu ---
        let durationStr = '-';
        let avgSpeedStr = '-';
        let avgPaceStr = '-';
        let caloriesStr = '0';

        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];
        if (firstPoint?.time && lastPoint?.time) {
          const durationMs = new Date(lastPoint.time) - new Date(firstPoint.time);

          if (durationMs > 0) {
            const totalMinutes = durationMs / (1000 * 60);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = Math.floor(totalMinutes % 60);
            durationStr = `${hours}h ${minutes}m`;

            const durationHours = durationMs / (1000 * 60 * 60);
            const distanceFloat = parseFloat(distanceKm);

            // Kecepatan rata-rata
            avgSpeedStr = (distanceFloat / durationHours).toFixed(1);

            // Pace rata-rata: berapa menit per 1 km
            const paceMinPerKm = totalMinutes / distanceFloat;
            const paceMin = Math.floor(paceMinPerKm);
            const paceSec = Math.round((paceMinPerKm - paceMin) * 60);
            avgPaceStr = `${paceMin}:${paceSec.toString().padStart(2, '0')}`;

            // Estimasi kalori menggunakan rumus MET
            // MET lari ~8, berat badan default 70kg
            // Kalori = MET × berat_badan(kg) × durasi(jam)
            const MET = 8;
            const defaultWeightKg = 70;
            caloriesStr = Math.round(MET * defaultWeightKg * durationHours).toString();
          }
        }

        // --- Kalkulasi segmen kecepatan untuk peta heatmap ---
        const rawSegments = [];
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          if (!p1.time || !p2.time) continue;

          const timeDiffHours = (new Date(p2.time) - new Date(p1.time)) / (1000 * 60 * 60);
          if (timeDiffHours <= 0) continue;

          const segDistKm = haversineDistanceKm(p1.lat, p1.lon, p2.lat, p2.lon);
          const segSpeedKmh = segDistKm / timeDiffHours;
          const color = getSpeedColor(segSpeedKmh);

          rawSegments.push({
            positions: [[p1.lat, p1.lon], [p2.lat, p2.lon]],
            color,
          });
        }

        // Optimasi: gabungkan segmen berurutan dengan warna yang sama
        // agar tidak me-render ribuan komponen Polyline terpisah di Leaflet.
        const groupedSegments = [];
        let currentGroup = null;
        for (const seg of rawSegments) {
          if (!currentGroup || currentGroup.color !== seg.color) {
            currentGroup = { color: seg.color, positions: [seg.positions[0]] };
            groupedSegments.push(currentGroup);
          }
          currentGroup.positions.push(seg.positions[1]);
        }

        // --- Chart data ---
        const validElevPoints = points.filter((p) => p.ele != null);
        const elevations = validElevPoints.map((p) => p.ele);

        if (elevations.length > 0) {
          setElevationChartData({
            labels: elevations.map((_, i) => i),
            datasets: [{
              fill: true, data: elevations, borderColor: '#1D9E75',
              backgroundColor: 'rgba(29, 158, 117, 0.15)', borderWidth: 1.5,
              pointRadius: 0, tension: 0.3,
            }],
          });
          setElevationDistributionData(buildElevationDistributionData(elevations));
        } else {
          setElevationChartData(null);
          setElevationDistributionData(null);
        }

        // --- Waypoints ---
        const parsedWaypoints = (gpx.waypoints || []).map((wp, index) => ({
          id: index,
          name: wp.name || `Titik Koordinat ${index + 1}`,
          color: ['#1D9E75', '#5DCAA5', '#EF9F27', '#D85A30'][index % 4],
        }));

        // --- Update state ---
        setTrackSummary({
          fileName: file.name, distance: distanceKm, duration: durationStr,
          elevGain, avgSpeed: avgSpeedStr, maxElev, waypointsCount: parsedWaypoints.length,
          avgPace: avgPaceStr,
          calories: caloriesStr,
        });
        setWaypointsList(parsedWaypoints);
        setRouteCoordinates(coordinates);
        setSpeedSegments(groupedSegments);

      } catch (err) {
        console.error("Gagal memproses file GPX:", err);
        alert("Terjadi kesalahan saat membaca file. Pastikan file .gpx tidak korup.");
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (event) => processFile(event.target.files[0]);

  const handleDrop = (event) => {
    event.preventDefault();
    processFile(event.dataTransfer.files[0]);
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
            handleDrop={handleDrop}
            trackSummary={trackSummary}
            elevationChartData={elevationChartData}
            elevationDistributionData={elevationDistributionData}
            waypointsList={waypointsList}
            isDataLoaded={routeCoordinates.length > 0}
          />
          <MapArea
            routeCoordinates={routeCoordinates}
            speedSegments={speedSegments}
            fileName={trackSummary.fileName}
            distance={trackSummary.distance}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
