# TerraSpectra - Hyperspectral Crop Disease Forecasting Dashboard

**Domain:** Precision Agriculture & Advanced Computer Vision  
**Frontend Architecture:** React (Vite) + Deck.gl v9 + Mapbox GL JS  

---

## 🛰️ Overview

Traditional satellite crop monitoring using standard RGB or simple infrared indices (like basic NDVI) only detects crop diseases after leaves turn yellow or brown (Day 28+), which is too late to save the harvest. Standard 2D CNNs cannot process the massive depth of data required for early detection.

**TerraSpectra** ingests hyperspectral satellite cubes (capturing 200+ contiguous spectral bands from NASA's EO-1 Hyperion / Sentinel-2 missions). By analyzing subtle biochemical changes in chlorophyll reflectance and red-edge slope anomalies (705nm–740nm), the platform predicts fungal blight outbreaks **3 weeks pre-symptomatic**, enabling targeted preventative bio-fungicide application.

---

## 🗺️ Week 1 GIS & Map Scaffolding Architecture

This repository delivers the **Week 1 GIS Map Scaffolding**:
- **Deck.gl v9 & Mapbox GL Engine:** Full 3D camera controls (pitch tilt up to 85°, bearing rotation, zoom, camera fly-to transitions).
- **Dual Basemap Pipeline:**
  1. *Hardware-accelerated ESRI World Imagery*: High-resolution satellite topography rendered directly via Deck.gl `TileLayer` & `BitmapLayer` with zero API token required.
  2. *Mapbox GL JS Vector & Satellite Streets*: Synchronized camera integration with custom user Mapbox access token support.
- **Geographical Farm Layers:**
  - **1,000-Acre Farm Boundary:** Real-world cadastral boundary (`GeoJsonLayer`).
  - **Cultivation Sectors (A, B, C, D):** 4 major agricultural zones with 3D height extrusions (`GeoJsonLayer` / `PolygonLayer`).
  - **5-Acre Blight Hotspot:** Targeted critical early warning polygon with animated pulse glow highlighting 3-week pre-symptomatic fungal infection.
  - **30m GSD Hyperspectral Pixel Grid:** Downscaled satellite raster cells (`ColumnLayer`) dynamically color-coded by biochemical stress.
  - **Ground IoT Radiometer Stations:** Real-time sensor calibration nodes (`ScatterplotLayer`).
  - **Hydraulic & Irrigation Networks:** Primary pressurized canals and drip manifold lines (`GeoJsonLayer`).
  - **3D Spatial Billboards:** Dynamic labels positioned in 3D coordinate space (`TextLayer`).

---

## 🚀 Getting Started

### 1. Installation
```bash
cd frontend
npm install
```

### 2. Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🎛️ Dashboard Controls

- **Hotspot Fly-To:** Click `Inspect 5-Ac Blight Zone` or the warning badge to trigger a 3D camera fly-to transition focused on the fungal outbreak anomaly.
- **3D Pitch Toggle:** Toggle between 2D orthographic top-down and 55° oblique 3D perspective with height extrusions.
- **Interactive Tooltip:** Hover over any sector, pixel cell, or IoT sensor to inspect acreage, chlorophyll reflectance, and disease prediction confidence.
- **Spectral Band Selector:** Switch between Full Cube (220 bands), Chlorophyll (680nm), Red-Edge (705nm), NIR (850nm), and SWIR Moisture (1650nm).
