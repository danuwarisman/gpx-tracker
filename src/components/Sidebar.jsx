import React, { useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';

export default function Sidebar({
  triggerFileUpload,
  handleDrop,
  trackSummary,
  elevationChartData,
  elevationDistributionData,
  waypointsList,
  isDataLoaded,
  dailyCalorieTarget,
  setDailyCalorieTarget,
  dailyCaloriesBurned,
  fitnessHistory,
  getCalorieSurplus,
  getCalorieProgress,
  resetDailyCalories,
}) {

  const [isDragging, setIsDragging] = useState(false);
  const [targetInput, setTargetInput] = useState(dailyCalorieTarget.toString());
  const [showHistory, setShowHistory] = useState(false);

  // Update targetInput when dailyCalorieTarget changes
  React.useEffect(() => {
    setTargetInput(dailyCalorieTarget.toString());
  }, [dailyCalorieTarget]);

  // Opsi chart profil elevasi (Line)
  const elevationProfileOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: { label: (ctx) => `${ctx.parsed.y} m` },
      },
    },
    scales: { x: { display: false }, y: { display: false, beginAtZero: false } },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
  };

  // Opsi chart distribusi elevasi (Bar)
  const elevationDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          title: (items) => `Ketinggian: ${items[0].label}`,
          label: (ctx) => `${ctx.parsed.y} titik GPS`,
        },
      },
    },
    scales: {
      x: {
        ticks: { font: { size: 9 }, color: '#94a3b8', maxRotation: 0 },
        grid: { display: false },
      },
      y: { display: false },
    },
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => { setIsDragging(false); handleDrop(e); };

  // Statistik yang ditampilkan di grid (9 item: + avgElev)
  const statsGrid = [
    { label: 'Distance',   value: trackSummary.distance,      unit: 'km'   },
    { label: 'Duration',   value: trackSummary.duration,      unit: ''     },
    { label: 'Avg Pace',   value: trackSummary.avgPace,       unit: '/km'  },
    { label: 'Avg Speed',  value: trackSummary.avgSpeed,      unit: 'km/h' },
    { label: 'Elev. Gain', value: trackSummary.elevGain,      unit: 'm'    },
    { label: 'Avg Elev.',  value: trackSummary.avgElev,       unit: 'm'    },
    { label: 'Max Elev.',  value: trackSummary.maxElev,       unit: 'm'    },
    { label: 'Kalori*',    value: trackSummary.calories,      unit: 'kkal' },
    { label: 'Waypoints',  value: trackSummary.waypointsCount, unit: ''    },
  ];

  return (
    <div className="border-r border-slate-200 p-4 flex flex-col gap-6 overflow-y-auto bg-white custom-scrollbar">

      {/* Drop Zone */}
      <div
        onClick={triggerFileUpload}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`cursor-pointer border-2 border-dashed rounded-xl px-4 py-6 flex flex-col items-center gap-3 transition-colors ${
          isDragging
            ? 'border-green-500 bg-green-50'
            : 'border-slate-300 bg-slate-50 hover:border-green-400 hover:bg-green-50/50'
        }`}
      >
        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
          <svg viewBox="0 0 16 16" fill="none" className="w-5 h-5">
            <path d="M8 2v8M5 7l3 3 3-3M3 12h10" stroke="#1D9E75" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-900">
          {isDragging ? 'Lepaskan file di sini!' : 'Drop .gpx file here'}
        </p>
        <p className="text-xs text-slate-600">or click to browse</p>
      </div>

      {/* Track Summary */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium tracking-widest text-slate-600 uppercase">Track Summary</div>
        <div className="grid grid-cols-2 gap-2">
          {statsGrid.map((stat) => (
            <div
              key={stat.label}
              className="bg-slate-50 border border-slate-100 rounded-xl p-3 hover:bg-slate-100 transition-colors"
            >
              <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
              <div className="text-xl font-medium text-slate-900 leading-tight">
                {stat.value}
                {stat.unit && (
                  <span className="text-xs text-slate-500 ml-1">{stat.unit}</span>
                )}
              </div>
            </div>
          ))}
        </div>
        {/* Catatan kaki untuk estimasi kalori */}
        {isDataLoaded && (
          <p className="text-[10px] text-slate-400 italic px-1">
            * Estimasi kalori menggunakan asumsi berat badan 70 kg (MET = 8).
          </p>
        )}
      </div>

      {/* Elevation Profile Chart */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium tracking-widest text-slate-600 uppercase">Profil Elevasi</div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 h-[100px] relative">
          {elevationChartData ? (
            <Line data={elevationChartData} options={elevationProfileOptions} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 italic text-center px-4">
              {isDataLoaded ? 'Data elevasi tidak tersedia.' : 'Upload file untuk melihat grafik.'}
            </div>
          )}
        </div>
      </div>

      {/* Elevation Distribution Chart */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium tracking-widest text-slate-600 uppercase">Distribusi Elevasi</div>
          <span className="text-[10px] text-slate-400">frekuensi titik GPS</span>
        </div>
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 h-[100px] relative">
          {elevationDistributionData ? (
            <Bar data={elevationDistributionData} options={elevationDistributionOptions} />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-500 italic text-center px-4">
              {isDataLoaded ? 'Data elevasi tidak tersedia.' : 'Upload file untuk melihat distribusi.'}
            </div>
          )}
        </div>
      </div>

      {/* Waypoints */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium tracking-widest text-slate-600 uppercase">Waypoints</div>
        <div className="flex flex-col gap-2">
          {waypointsList.length > 0 ? (
            waypointsList.map((wp) => (
              <div
                key={wp.id}
                className="border border-slate-100 rounded-lg p-3 flex items-center gap-3 hover:bg-slate-50"
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: wp.color }} />
                <span className="text-sm text-slate-900 flex-1 truncate">{wp.name}</span>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-500 italic p-2 text-center bg-slate-50 rounded-lg border border-slate-100">
              Tidak ada waypoints di rute ini.
            </div>
          )}
        </div>
      </div>

      {/* Fitness Tracking */}
      <div className="flex flex-col gap-2">
        <div className="text-xs font-medium tracking-widest text-slate-600 uppercase">Fitness Tracking</div>
        
        {/* Daily Calorie Target */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-2">Target Kalori Harian</div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              onBlur={() => {
                const newTarget = parseInt(targetInput, 10);
                if (!isNaN(newTarget) && newTarget > 0) {
                  setDailyCalorieTarget(newTarget);
                } else {
                  setTargetInput(dailyCalorieTarget.toString());
                }
              }}
              className="flex-1 px-2 py-1 text-sm border border-slate-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
              min="1"
            />
            <span className="text-xs text-slate-500">kkal</span>
          </div>
        </div>

        {/* Daily Calories Burned */}
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
          <div className="text-xs text-slate-500 mb-2">Kalori Terbakar Hari Ini</div>
          <div className="text-xl font-medium text-slate-900">
            {dailyCaloriesBurned}
            <span className="text-xs text-slate-500 ml-1">kkal</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCalorieProgress()}%` }}
              ></div>
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {getCalorieSurplus() >= 0 ? `Surplus: +${getCalorieSurplus()}` : `Defisit: ${getCalorieSurplus()}`} kkal
            </div>
          </div>
        </div>

        {/* Reset Button */}
        <button
          onClick={resetDailyCalories}
          className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg py-2 px-3 text-xs text-slate-700 transition-colors"
        >
          Reset Kalori Harian
        </button>

        {/* Activity History */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg py-2 px-3 text-xs text-slate-700 transition-colors"
          >
            {showHistory ? 'Sembunyikan' : 'Tampilkan'} Riwayat Aktivitas
          </button>
          
          {showHistory && (
            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg">
              {fitnessHistory.length > 0 ? (
                fitnessHistory.map((activity) => (
                  <div key={activity.id} className="p-2 border-b border-slate-100 last:border-b-0">
                    <div className="text-xs font-medium text-slate-900">{activity.fileName}</div>
                    <div className="text-xs text-slate-500">
                      {activity.distance} km • {activity.duration} • {activity.calories} kkal
                    </div>
                    <div className="text-xs text-slate-400">{new Date(activity.timestamp).toLocaleDateString()}</div>
                  </div>
                ))
              ) : (
                <div className="p-2 text-xs text-slate-500 italic text-center">
                  Belum ada aktivitas.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
