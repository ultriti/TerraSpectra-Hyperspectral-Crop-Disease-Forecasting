<<<<<<< HEAD
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <div>
      <Dashboard />
    </div>
  );
}

export default App;
=======
import { useState, useCallback, useEffect } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import TerraMap from "./components/TerraMap";
import MapControls from "./components/MapControls";
import Legend from "./components/Legend";
import Tooltip from "./components/Tooltip";
import DiseaseAnalyzerModal from "./components/DiseaseAnalyzerModal";

import { FARM_CENTER } from "./data/farmData";
import { BASEMAP_STYLES, SPECTRAL_BANDS } from "./data/constants";
import { checkBackendHealth, fetchFarmOverview } from "./services/api";
import "./App.css";

export default function App() {
  // 3D Camera View State
  const [viewState, setViewState] = useState({
    longitude: FARM_CENTER.longitude,
    latitude: FARM_CENTER.latitude,
    zoom: FARM_CENTER.zoom,
    pitch: FARM_CENTER.pitch,
    bearing: FARM_CENTER.bearing,
    maxPitch: 85,
    minZoom: 9,
    maxZoom: 20
  });

  const [is3D, setIs3D] = useState(true);

  // Active Map Configuration
  const [activeBasemap, setActiveBasemap] = useState(BASEMAP_STYLES[0]);
  const [activeBand, setActiveBand] = useState(SPECTRAL_BANDS[0]);
  const [mapboxToken, setMapboxToken] = useState("");

  // GIS Layer Toggles
  const [layerVisibility, setLayerVisibility] = useState({
    farmBoundary: true,
    sectors: true,
    blightZone: true,
    pixelGrid: true,
    elevation3D: true,
    irrigation: true,
    sensors: true,
    labels: true
  });

  // Hover Tooltip State
  const [hoverInfo, setHoverInfo] = useState(null);

  // Backend API Status & Telemetry
  const [backendStatus, setBackendStatus] = useState({ online: false, data: null, error: null });
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState(false);

  // Check Backend Health on demand
  const handleCheckBackend = useCallback(async () => {
    const status = await checkBackendHealth();
    setBackendStatus(status);
    if (status.online) {
      const overview = await fetchFarmOverview();
      if (overview) {
        console.log("Synchronized farm overview from FastAPI backend:", overview);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchStatus = async () => {
      const status = await checkBackendHealth();
      if (isMounted) {
        setBackendStatus(status);
        if (status.online) {
          fetchFarmOverview().then((overview) => {
            if (overview) {
              console.log("Synchronized farm overview from FastAPI backend:", overview);
            }
          });
        }
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fly Camera to 5-Acre Blight Hotspot
  const handleFocusBlight = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      longitude: -121.6042,
      latitude: 36.6662,
      zoom: 16.4,
      pitch: 58,
      bearing: -35,
      transitionDuration: 1800
    }));
    // Ensure critical layers are on
    setLayerVisibility(prev => ({
      ...prev,
      blightZone: true,
      pixelGrid: true,
      elevation3D: true
    }));
  }, []);

  // Reset to 1,000-Acre Overview
  const handleResetView = useCallback(() => {
    setViewState(prev => ({
      ...prev,
      longitude: FARM_CENTER.longitude,
      latitude: FARM_CENTER.latitude,
      zoom: FARM_CENTER.zoom,
      pitch: FARM_CENTER.pitch,
      bearing: FARM_CENTER.bearing,
      transitionDuration: 1400
    }));
  }, []);

  // Focus on individual agricultural sectors
  const handleFocusSector = useCallback((sectorKey) => {
    const coords = {
      A: { lon: -121.6040, lat: 36.6650, zoom: 15.2, pitch: 45, bearing: -20 },
      B: { lon: -121.6160, lat: 36.6650, zoom: 15.2, pitch: 45, bearing: -20 },
      C: { lon: -121.6160, lat: 36.6550, zoom: 15.2, pitch: 45, bearing: -20 },
      D: { lon: -121.6040, lat: 36.6550, zoom: 15.2, pitch: 45, bearing: -20 }
    }[sectorKey];

    if (coords) {
      setViewState(prev => ({
        ...prev,
        longitude: coords.lon,
        latitude: coords.lat,
        zoom: coords.zoom,
        pitch: coords.pitch,
        bearing: coords.bearing,
        transitionDuration: 1400
      }));
    }
  }, []);

  return (
    <div className="terra-app">
      {/* Top Navigation & Telemetry HUD */}
      <Header
        onFocusBlight={handleFocusBlight}
        onResetView={handleResetView}
        mapboxToken={mapboxToken}
        setMapboxToken={setMapboxToken}
        backendStatus={backendStatus}
        onCheckBackend={handleCheckBackend}
        onOpenAnalyzer={() => setIsAnalyzerOpen(true)}
      />

      {/* Main Workspace */}
      <main className="terra-workspace">
        {/* Interactive GIS Sidebar */}
        <Sidebar
          layerVisibility={layerVisibility}
          setLayerVisibility={setLayerVisibility}
          activeBasemap={activeBasemap}
          setActiveBasemap={setActiveBasemap}
          activeBand={activeBand}
          setActiveBand={setActiveBand}
          onFocusBlight={handleFocusBlight}
          onFocusSector={handleFocusSector}
          onOpenAnalyzer={() => setIsAnalyzerOpen(true)}
          backendStatus={backendStatus}
        />

        {/* 3D Map Viewport (Deck.gl + Mapbox) */}
        <div className="map-stage">
          <TerraMap
            viewState={viewState}
            setViewState={setViewState}
            layerVisibility={layerVisibility}
            activeBasemap={activeBasemap}
            activeBand={activeBand}
            mapboxToken={mapboxToken}
            hoverInfo={hoverInfo}
            setHoverInfo={setHoverInfo}
            is3D={is3D}
          />

          {/* On-Map HUD Controls */}
          <MapControls
            viewState={viewState}
            setViewState={setViewState}
            onResetView={handleResetView}
            onFocusBlight={handleFocusBlight}
            is3D={is3D}
            setIs3D={setIs3D}
          />

          {/* Cartographic Legend */}
          <Legend
            showBlightZone={layerVisibility.blightZone}
            activeBand={activeBand}
          />

          {/* Interactive Inspection Tooltip */}
          <Tooltip info={hoverInfo} />
        </div>
      </main>

      {/* AI Disease Inference Modal (FastAPI route /predict_plant_health) */}
      <DiseaseAnalyzerModal
        isOpen={isAnalyzerOpen}
        onClose={() => setIsAnalyzerOpen(false)}
        backendStatus={backendStatus}
        onFlyToSector={handleFocusSector}
      />
    </div>
  );
}
>>>>>>> origin/main
