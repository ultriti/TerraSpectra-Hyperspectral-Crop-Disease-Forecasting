import React, { useMemo, useRef, useState } from "react";
import Map, { useControl } from "react-map-gl/mapbox";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { GeoJsonLayer } from "@deck.gl/layers";

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

import { farmBoundary } from "../../data/farmData";

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
  const token = import.meta.env.VITE_MAPBOX_TOKEN;

  const mapRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState("");

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [viewState, setViewState] = useState({
    longitude: 77.5225,
    latitude: 13.282,
    zoom: 15,
    pitch: 0,
    bearing: 0,
  });

  // --------------------------------------------------
  // Farm Boundary Layer
  // --------------------------------------------------

  const layers = useMemo(
    () => [
      new GeoJsonLayer({
        id: "farm-boundary",
        data: farmBoundary,

        filled: true,
        stroked: true,
        pickable: true,

        getFillColor: [16, 185, 129, 45],
        getLineColor: [16, 185, 129, 255],

        getLineWidth: 3,
        lineWidthMinPixels: 2,

        autoHighlight: true,
        highlightColor: [34, 211, 238, 120],

        onClick: ({ object }) => {
          if (object) {
            console.log("Selected Farm:", object.properties);
          }
        },
      }),
    ],
    [],
  );

  // --------------------------------------------------
  // Map Controls
  // --------------------------------------------------

  const zoomIn = () => {
    mapRef.current?.zoomIn({
      duration: 300,
    });
  };

  const zoomOut = () => {
    mapRef.current?.zoomOut({
      duration: 300,
    });
  };

  const resetView = () => {
    mapRef.current?.flyTo({
      center: [77.5225, 13.282],
      zoom: 15,
      pitch: 0,
      bearing: 0,
      duration: 1200,
    });
  };

  const toggleFullscreen = () => {
    setIsFullscreen((previous) => !previous);
  };

  // --------------------------------------------------
  // Missing Token
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
            Add VITE_MAPBOX_TOKEN to your environment file.
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
        onMove={(event) => {
          setViewState(event.viewState);
        }}
        onLoad={() => {
          setMapLoaded(true);
          setMapError("");
        }}
        onError={(event) => {
          console.error("Mapbox Error:", event.error);

          setMapError(event.error?.message || "Unable to load Mapbox.");
        }}
        mapboxAccessToken={token}
        mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
        attributionControl={false}
        reuseMaps
        maxPitch={85}
        minZoom={3}
        maxZoom={22}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <DeckOverlay interleaved={true} layers={layers} />
      </Map>

      {/* MAP LOADING / ERROR OVERLAY */}

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
              {mapError
                ? "Map Initialization Failed"
                : "Initializing TerraSpectra"}
            </h3>

            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {mapError || "Loading satellite imagery and geospatial layers..."}
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
              <h2 className="text-xs font-bold tracking-wide text-white">
                TerraSpectra
              </h2>

              <p className="mt-1 text-[10px] text-slate-400">
                Geospatial Intelligence
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 border-t border-slate-800 pt-3">
            <span
              className={`h-2 w-2 rounded-full ${
                mapLoaded
                  ? "bg-emerald-400"
                  : mapError
                    ? "bg-rose-400"
                    : "bg-amber-400 animate-pulse"
              }`}
            />

            <span className="text-[10px] text-slate-400">
              {mapLoaded
                ? "Map Engine Online"
                : mapError
                  ? "Map Engine Error"
                  : "Initializing Map"}
            </span>
          </div>
        </div>
      </div>

      {/* TOP RIGHT CONTROLS */}

      <div className="absolute right-4 top-4 z-30 flex gap-2">
        <MapButton title="Reset Map View" onClick={resetView}>
          <Crosshair size={18} />
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

            <span className="text-[10px] font-semibold text-slate-300">
              Farm Boundary
            </span>

            <span
              className={`h-1.5 w-1.5 rounded-full ${
                mapLoaded ? "bg-emerald-400" : "bg-slate-600"
              }`}
            />
          </div>

          <div className="mt-2 flex items-center gap-2">
            <Activity size={12} className="text-cyan-400" />

            <span className="text-[9px] text-slate-500">
              {mapLoaded ? "Deck.gl Layer Active" : "Waiting for Map Engine"}
            </span>
          </div>
        </div>
      </div>

      {/* BOTTOM LEFT COORDINATES */}

      <div className="pointer-events-none absolute bottom-4 left-4 z-30">
        <div className="rounded-xl border border-slate-700/70 bg-slate-950/90 p-3 shadow-xl backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-cyan-400" />

            <span className="text-xs font-semibold text-slate-200">
              Farm Geospatial View
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-3">
            <MapInfo label="LATITUDE" value={viewState.latitude.toFixed(5)} />

            <MapInfo label="LONGITUDE" value={viewState.longitude.toFixed(5)} />

            <MapInfo label="ZOOM LEVEL" value={viewState.zoom.toFixed(1)} />

            <MapInfo
              label="BEARING"
              value={`${Math.round(viewState.bearing)}°`}
            />
          </div>
        </div>
      </div>

      {/* BOTTOM RIGHT ZOOM CONTROLS */}

      <div className="absolute bottom-4 right-4 z-30 flex flex-col gap-2">
        <MapButton title="Zoom In" onClick={zoomIn}>
          <ZoomIn size={19} />
        </MapButton>

        <MapButton title="Zoom Out" onClick={zoomOut}>
          <ZoomOut size={19} />
        </MapButton>
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
// Coordinate Information
// --------------------------------------------------

function MapInfo({ label, value }) {
  return (
    <div>
      <p className="text-[8px] font-medium tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-mono text-[10px] font-medium text-slate-200">
        {value}
      </p>
    </div>
  );
}
