import React, { useEffect, useMemo, useRef, useState } from "react";
import Map, { useControl } from "react-map-gl/mapbox";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { GeoJsonLayer, ScatterplotLayer } from "@deck.gl/layers";

import {
  Satellite,
  Layers,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Crosshair,
  MapPin,
  Activity,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { farmBoundary, farmSectors, FARM_CENTER } from "../../data/farmData";

import "mapbox-gl/dist/mapbox-gl.css";

// --------------------------------------------------
// Deck.gl + Mapbox Integration
// --------------------------------------------------

function DeckOverlay(props) {
  const overlay = useControl(() => new MapboxOverlay(props));
  overlay.setProps(props);
  return null;
}

// --------------------------------------------------
// Main Farm Map
// --------------------------------------------------

export default function FarmMap() {
  // Support both env-var naming conventions
  const token =
    import.meta.env.VITE_MAPBOX_TOKEN ||
    import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  const mapRef = useRef(null);

  const [mapLoaded, setMapLoaded]       = useState(false);
  const [mapError, setMapError]         = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Prediction overlay state
  const [showPredictions, setShowPredictions] = useState(false);
  const [predData, setPredData]               = useState(null);
  const [hoveredFeature, setHoveredFeature]   = useState(null);

  const [viewState, setViewState] = useState({
    longitude: FARM_CENTER.longitude,
    latitude:  FARM_CENTER.latitude,
    zoom:      FARM_CENTER.zoom,
    pitch:     FARM_CENTER.pitch,
    bearing:   FARM_CENTER.bearing,
  });

  // --------------------------------------------------
  // Fetch Geo-Predictions when overlay is toggled on
  // --------------------------------------------------
  useEffect(() => {
    if (!showPredictions) return;
    if (predData) return; // already loaded

    const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
    fetch(`${API}/api/geo-predictions`)
      .then((r) => {
        if (!r.ok) throw new Error("API unavailable");
        return r.json();
      })
      .then((d) => setPredData(d))
      .catch(() => {
        // Inline synthetic fallback — matches real Doddaballapura farm bbox
        const LAT_N = 13.2970, LAT_S = 13.2910;
        const LON_W = 77.5195, LON_E = 77.5262;
        const features = [];
        for (let row = 0; row < 10; row++) {
          for (let col = 0; col < 20; col++) {
            const lat = LAT_N - (row / 9)  * (LAT_N - LAT_S);
            const lon = LON_W + (col / 19) * (LON_E - LON_W);
            const isStressed = col >= 12 && row >= 6;
            features.push({
              type: "Feature",
              geometry: { type: "Point", coordinates: [lon, lat] },
              properties: {
                class:       isStressed ? 1 : 0,
                label:       isStressed ? "Stressed" : "Healthy",
                probability: isStressed
                  ? Math.min(0.98, 0.65 + row * 0.025)
                  : Math.max(0.05, 0.10 + row * 0.025),
              },
            });
          }
        }
        setPredData({ type: "FeatureCollection", features });
      });
  }, [showPredictions, predData]);

  // --------------------------------------------------
  // Deck.gl Layers
  // --------------------------------------------------
  const layers = useMemo(() => {
    const baseLayers = [
      // Sector fills (semi-transparent, behind boundary)
      new GeoJsonLayer({
        id:    "farm-sectors",
        data:  farmSectors,
        filled:  true,
        stroked: true,
        pickable: false,
        getFillColor:  (f) => f.properties.color,
        getLineColor:  [100, 200, 140, 180],
        getLineWidth:  1,
        lineWidthMinPixels: 1,
      }),
      // Main farm boundary
      new GeoJsonLayer({
        id:    "farm-boundary",
        data:  farmBoundary,
        filled:  true,
        stroked: true,
        pickable: true,
        getFillColor:  [16, 185, 129, 20],
        getLineColor:  [16, 185, 129, 255],
        getLineWidth:  4,
        lineWidthMinPixels: 2,
        autoHighlight: true,
        highlightColor: [34, 211, 238, 120],
        onClick: ({ object }) => {
          if (object) console.log("Selected Farm:", object.properties);
        },
      }),
    ];

    if (showPredictions && predData) {
      baseLayers.push(
        new ScatterplotLayer({
          id:    "pred-layer",
          data:  predData.features || [],
          getPosition:  (f) => f.geometry.coordinates,
          getRadius:    15,
          radiusMinPixels: 5,
          radiusMaxPixels: 28,
          getFillColor: (f) => {
            if (f.properties.class === 0) return [34, 197, 94, 210];
            if (f.properties.probability > 0.8) return [220, 38, 38, 240];
            return [249, 115, 22, 230];
          },
          pickable:         true,
          autoHighlight:    true,
          highlightColor:   [255, 255, 255, 90],
          onHover: ({ object }) => setHoveredFeature(object || null),
        })
      );
    }

    return baseLayers;
  }, [showPredictions, predData]);

  // --------------------------------------------------
  // Map Controls
  // --------------------------------------------------
  const zoomIn  = () => mapRef.current?.zoomIn({ duration: 300 });
  const zoomOut = () => mapRef.current?.zoomOut({ duration: 300 });

  const resetView = () => {
    mapRef.current?.flyTo({
      center:   [FARM_CENTER.longitude, FARM_CENTER.latitude],
      zoom:     FARM_CENTER.zoom,
      pitch:    FARM_CENTER.pitch,
      bearing:  FARM_CENTER.bearing,
      duration: 1200,
    });
  };

  const toggleFullscreen = () => setIsFullscreen((p) => !p);

  // --------------------------------------------------
  // Missing Token Guard
  // --------------------------------------------------
  if (!token) {
    return (
      <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-rose-500/30 bg-slate-950 p-6">
        <div className="text-center">
          <AlertTriangle size={32} className="mx-auto text-rose-400" />
          <h3 className="mt-4 text-sm font-semibold text-white">
            Mapbox Token Missing
          </h3>
          <p className="mt-2 text-xs text-slate-400">
            Add <code className="text-rose-300">VITE_MAPBOX_TOKEN</code> to{" "}
            <code className="text-slate-300">frontend/.env</code>
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------
  return (
    <div
      className={`relative isolate overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-[9999] h-screen w-screen rounded-none"
          : "h-[68vh] min-h-[500px] w-full rounded-2xl"
      }`}
    >
      {/* MAP CANVAS */}
      <Map
        ref={mapRef}
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        onLoad={() => { setMapLoaded(true); setMapError(""); }}
        onError={(e) => {
          console.error("Mapbox Error:", e.error);
          setMapError(e.error?.message || "Unable to load Mapbox.");
        }}
        mapboxAccessToken={token}
        // mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        // mapStyle="mapbox://styles/mapbox/standard-satellite"
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        attributionControl={false}
        reuseMaps
        maxPitch={85}
        minZoom={3}
        maxZoom={22}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        <DeckOverlay interleaved={true} layers={layers} />
      </Map>

      {/* LOADING / ERROR OVERLAY */}
      {!mapLoaded && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950">
          <div className="max-w-sm px-6 text-center">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/5">
              {mapError ? (
                <AlertTriangle size={28} className="text-rose-400" />
              ) : (
                <Satellite size={28} className="text-cyan-400" />
              )}
              {!mapError && (
                <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-cyan-400" />
              )}
            </div>
            <h3 className="mt-5 text-sm font-semibold text-white">
              {mapError ? "Map Initialization Failed" : "Initializing TerraSpectra"}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {mapError || "Loading satellite imagery and geospatial layers…"}
            </p>
            {mapError && (
              <p className="mt-3 break-words rounded-lg bg-rose-500/10 p-3 text-left font-mono text-[10px] text-rose-300">
                {mapError}
              </p>
            )}
          </div>
        </div>
      )}

      {/* TOP LEFT HUD */}
      <div className="pointer-events-none absolute left-4 top-4 z-30">
        <div className="rounded-2xl border border-slate-700/70 bg-slate-950/90 p-4 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/30 bg-emerald-400/10">
              <Satellite size={20} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xs font-bold tracking-wide text-white">TerraSpectra</h2>
              <p className="mt-1 text-[10px] text-slate-400">Geospatial Intelligence</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-slate-800 pt-3">
            <span className={`h-2 w-2 rounded-full ${
              mapLoaded ? "bg-emerald-400" : mapError ? "bg-rose-400" : "animate-pulse bg-amber-400"
            }`} />
            <span className="text-[10px] text-slate-400">
              {mapLoaded ? "Map Engine Online" : mapError ? "Map Engine Error" : "Initializing Map"}
            </span>
          </div>
        </div>
      </div>

      {/* TOP RIGHT CONTROLS */}
      <div className="absolute right-4 top-4 z-30 flex gap-2">
        <MapButton title="Reset Map View" onClick={resetView}>
          <Crosshair size={18} />
        </MapButton>

        {/* Predictions Toggle */}
        <MapButton
          title={showPredictions ? "Hide Crop Predictions" : "Show Crop Predictions"}
          onClick={() => setShowPredictions((p) => !p)}
        >
          <span
            style={{ fontSize: 18, lineHeight: 1 }}
            className={showPredictions ? "text-green-400" : ""}
          >
            🌱
          </span>
        </MapButton>

        <MapButton title="Toggle Fullscreen" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </MapButton>
      </div>

      {/* TOP RIGHT LAYER STATUS */}
      <div className="absolute right-4 top-20 z-30">
        <div className="rounded-xl border border-slate-700/70 bg-slate-950/90 px-3 py-3 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <Layers size={14} className="text-emerald-400" />
            <span className="text-[10px] font-semibold text-slate-300">Farm Boundary</span>
            <span className={`h-1.5 w-1.5 rounded-full ${mapLoaded ? "bg-emerald-400" : "bg-slate-600"}`} />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Activity size={12} className={showPredictions ? "text-green-400" : "text-cyan-400"} />
            <span className="text-[9px] text-slate-500">
              {showPredictions
                ? (predData ? `${predData.features?.length || 0} prediction points` : "Loading…")
                : "Deck.gl Layer Active"}
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM LEFT COORDINATES */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-30">
        <div className="rounded-xl border border-slate-700/70 bg-slate-950/90 p-3 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-cyan-400" />
            <span className="text-xs font-semibold text-slate-200">Farm Geospatial View</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3">
            <MapInfo label="LATITUDE"   value={viewState.latitude.toFixed(5)} />
            <MapInfo label="LONGITUDE"  value={viewState.longitude.toFixed(5)} />
            <MapInfo label="ZOOM LEVEL" value={viewState.zoom.toFixed(1)} />
            <MapInfo label="BEARING"    value={`${Math.round(viewState.bearing)}°`} />
          </div>
        </div>
      </div>

      {/* HOVERED PREDICTION TOOLTIP */}
      {hoveredFeature && (
        <div className="pointer-events-none absolute bottom-28 left-4 z-30">
          <div className="rounded-xl border border-slate-700/70 bg-slate-950/95 p-3 shadow-xl backdrop-blur-xl">
            <p className="text-xs font-semibold text-white">{hoveredFeature.properties.label}</p>
            <p className="mt-1 text-[10px] text-slate-400">
              Stress Probability:{" "}
              <span className="font-mono text-slate-200">
                {(hoveredFeature.properties.probability * 100).toFixed(1)}%
              </span>
            </p>
            <p className="mt-0.5 text-[9px] text-slate-500">
              Class: {hoveredFeature.properties.class === 1 ? "⚠️ Stressed" : "✅ Healthy"}
            </p>
          </div>
        </div>
      )}

      {/* BOTTOM RIGHT ZOOM CONTROLS */}
      <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2">
        <MapButton title="Zoom In"  onClick={zoomIn}>
          <ZoomIn size={19} />
        </MapButton>
        <MapButton title="Zoom Out" onClick={zoomOut}>
          <ZoomOut size={19} />
        </MapButton>
      </div>

      {/* BOTTOM CENTER LEGEND */}
      <div className="pointer-events-none absolute bottom-14 left-1/2 z-30 -translate-x-1/2">
        <div className="flex gap-4 rounded-xl border border-slate-700/70 bg-slate-950/90 px-4 py-2 shadow-xl backdrop-blur-xl">
          <span className="flex items-center gap-1.5 text-[10px] text-slate-300">
            <span className="inline-block h-3 w-3 rounded-full bg-green-500" />
            Healthy
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-slate-300">
            <span className="inline-block h-3 w-3 rounded-full bg-orange-500" />
            Stressed
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-slate-300">
            <span className="inline-block h-3 w-3 rounded-full bg-red-600" />
            High Risk
          </span>
        </div>
      </div>

      {/* MAP ATTRIBUTION */}
      <div className="absolute bottom-1 right-16 z-10 text-[9px] text-slate-400/70">
        © Mapbox © OpenStreetMap
      </div>
    </div>
  );
}

// --------------------------------------------------
// Reusable Map Button
// --------------------------------------------------
function MapButton({ children, onClick, title }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700/70 bg-slate-950/90 text-slate-300 shadow-xl backdrop-blur-xl transition hover:border-cyan-400/40 hover:bg-slate-900 hover:text-cyan-400"
    >
      {children}
    </button>
  );
}

// --------------------------------------------------
// Coordinate Display
// --------------------------------------------------
function MapInfo({ label, value }) {
  return (
    <div>
      <p className="text-[8px] font-medium tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 font-mono text-[10px] font-medium text-slate-200">{value}</p>
    </div>
  );
}
