# GPX Tracker

A modern web application for analyzing GPS running and exercise tracks. Upload GPX files to visualize routes on an interactive map, analyze elevation profiles, view statistics, and track fitness metrics.

## 🌟 Features

### Route Analysis
- 📍 **Interactive Map** - View your routes on an OpenStreetMap-based interactive map powered by Leaflet
- 🎨 **Speed Heatmap** - Visualize speed variations along your route with color-coded segments
- 📊 **Elevation Profile** - Chart showing elevation changes throughout your run
- 📈 **Elevation Distribution** - Histogram showing frequency distribution of elevation bands
- 🎯 **Waypoints** - Display and manage waypoints from your GPX file

### Track Statistics
- **Distance** - Total route distance in kilometers
- **Duration** - Total running/exercise time
- **Average Pace** - Calculated in mm:ss per kilometer
- **Average Speed** - km/h
- **Elevation Metrics** - Gain, max altitude, and average elevation
- **Calorie Estimation** - Estimated calories burned based on MET formula

### Fitness Tracking
- 💪 **Daily Calorie Target** - Set and manage your daily calorie burn goal
- 📊 **Progress Tracking** - Visual progress bar showing daily calories burned vs. target
- 📋 **Activity History** - Keep track of your last 50 activities with timestamps
- 💾 **Persistent Storage** - Data saved in browser's localStorage
- 🔄 **Auto-Reset** - Daily calorie counter resets at midnight

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/danuwarisman/gpx-tracker.git
cd gpx-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173/`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## 📁 How to Use

1. **Load a GPX File** - Click the "Load GPX" button or drag & drop a .gpx file into the upload zone
2. **View Your Route** - The map will automatically center on your route
3. **Analyze Statistics** - Check the sidebar for detailed track information
4. **Toggle Speed Heatmap** - Click the mode toggle button to see speed variations
5. **Manage Fitness Goal** - Set your daily calorie target and track progress

## 🛠 Tech Stack

- **React 19.2** - UI framework
- **Vite 8** - Build tool and dev server
- **Leaflet 1.9** - Interactive mapping
- **React-Leaflet 5** - React wrapper for Leaflet
- **Chart.js 4.5** - Data visualization
- **Tailwind CSS 3.4** - Styling
- **GPX Parser 3.0** - GPX file parsing

## 📋 Project Structure

```
src/
├── App.jsx              # Main application component
├── components/
│   ├── Topbar.jsx       # Header with file upload
│   ├── Sidebar.jsx      # Statistics and charts
│   └── MapArea.jsx      # Interactive map display
├── App.css              # Component styles
├── index.css            # Tailwind imports
└── main.jsx             # React entry point
```

## 🎨 Color Scheme

Speed visualization uses an intuitive heatmap:
- 🔵 **Blue** (<7 km/h) - Easy jogging
- 🟢 **Green** (7-10 km/h) - Normal running pace
- 🟠 **Orange** (10-14 km/h) - Fast running
- 🔴 **Red** (>14 km/h) - Sprint

## 📝 Notes

- Calorie estimation assumes 70 kg body weight and MET value of 8 (running)
- GPS data is processed entirely in the browser (no server uploads)
- Supported file format: .gpx (GPS Exchange Format)
- Activities are stored in browser localStorage

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

Created by Danu Warisman

---

**Happy tracking! 🏃‍♂️**
