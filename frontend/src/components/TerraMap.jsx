import React, { useState, useEffect, useRef, useMemo } from "react";
import DeckGL from "@deck.gl/react";
import { TileLayer } from "@deck.gl/geo-layers";
import {
  BitmapLayer,
  GeoJsonLayer,
  PolygonLayer,
  ScatterplotLayer,
  TextLayer,
  PathLayer,
  ColumnLayer
} from "@deck.gl/layers";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import {
  FARM_CENTER,
  FARM_BOUNDARY_GEOJSON,
  FARM_SECTORS_GEOJSON,
  BLIGHT_PREDICTION_ZONE_GEOJSON,
  SENSOR_STATIONS,
  IRRIGATION_LINES_GEOJSON,
  generateSpectralPixelGrid
} from "../data/farmData";

export default function TerraMap({
  viewState,
  setViewState,
  layerVisibility,
  activeBasemap,
  activeBand,
  mapboxToken,
  hoverInfo,
  setHoverInfo,
  is3D
}) {
  const mapContainerRef = useRef(null);
  const mapboxInstanceRef = useRef(null);
  const [pulsePhase, setPulsePhase] = useState(0);

  // Generate simulated 30m GSD pixel grid
  const pixelGridData = useMemo(() => generateSpectralPixelGrid(), []);

  // Pulse animation for the 5-acre disease prediction hotspot
  useEffect(() => {
    const interval = setInterval(() => {
      setPulsePhase((prev) => (prev + 0.1) % (Math.PI * 2));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Sync Mapbox GL JS if Mapbox Token is provided
  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current) {
      if (mapboxInstanceRef.current) {
        mapboxInstanceRef.current.remove();
        mapboxInstanceRef.current = null;
      }
      return;
    }

    try {
      mapboxgl.accessToken = mapboxToken;
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
        pitch: viewState.pitch,
        bearing: viewState.bearing,
        interactive: false,
        attributionControl: false
      });

      map.on("load", () => {
        mapboxInstanceRef.current = map;
      });

      return () => {
        map.remove();
        mapboxInstanceRef.current = null;
      };
    } catch (err) {
      console.warn("Mapbox initialization error:", err);
    }
  }, [mapboxToken]);

  // Keep Mapbox camera in sync with Deck.gl viewState
  useEffect(() => {
    if (mapboxInstanceRef.current) {
      mapboxInstanceRef.current.jumpTo({
        center: [viewState.longitude, viewState.latitude],
        zoom: viewState.zoom,
        pitch: viewState.pitch,
        bearing: viewState.bearing
      });
    }
  }, [viewState]);

  // Build Deck.gl Layers
  const layers = useMemo(() => {
    const layerList = [];

    // 1. BASE MAP TILE LAYER (Deck.gl Hardware-Accelerated Raster Tiles)
    // Runs when no Mapbox token is active, or user selects ESRI Satellite / Carto Dark
    if (!mapboxToken && activeBasemap && activeBasemap.tiles && activeBasemap.tiles.length > 0) {
      layerList.push(
        new TileLayer({
          id: `base-tiles-${activeBasemap.id}`,
          data: activeBasemap.tiles[0],
          minZoom: 0,
          maxZoom: activeBasemap.maxZoom || 19,
          tileSize: 256,
          renderSubLayers: (props) => {
            const {
              bbox: { west, south, east, north }
            } = props.tile;

            return new BitmapLayer(props, {
              data: null,
              image: props.data,
              bounds: [west, south, east, north]
            });
          }
        })
      );
    }

    // 2. 1,000-ACRE OUTER FARM BOUNDARY LAYER
    if (layerVisibility.farmBoundary) {
      layerList.push(
        new GeoJsonLayer({
          id: "farm-boundary-layer",
          data: FARM_BOUNDARY_GEOJSON,
          filled: true,
          stroked: true,
          getFillColor: [0, 255, 136, 12],
          getLineColor: [0, 255, 136, 220],
          getLineWidth: 4,
          lineWidthUnits: "pixels",
          pickable: true,
          autoHighlight: true,
          highlightColor: [0, 255, 136, 60]
        })
      );
    }

    // 3. AGRICULTURAL SECTOR PARCELS (A, B, C, D)
    if (layerVisibility.sectors) {
      layerList.push(
        new GeoJsonLayer({
          id: "farm-sectors-layer",
          data: FARM_SECTORS_GEOJSON,
          filled: true,
          stroked: true,
          extruded: is3D && layerVisibility.elevation3D,
          getElevation: (f) => (f.properties.elevation || 20) * 3,
          getFillColor: (f) => f.properties.color || [46, 204, 113, 120],
          getLineColor: [255, 255, 255, 180],
          getLineWidth: 2,
          lineWidthUnits: "pixels",
          pickable: true,
          autoHighlight: true,
          highlightColor: [255, 255, 255, 60]
        })
      );
    }

    // 4. HYPERSPECTRAL 30M GSD PIXEL GRID RASTER
    if (layerVisibility.pixelGrid) {
      layerList.push(
        new ColumnLayer({
          id: "spectral-pixel-grid-layer",
          data: pixelGridData,
          diskResolution: 4, // Render as square cells
          radius: 45,
          angle: 45,
          extruded: is3D && layerVisibility.elevation3D,
          getPosition: (d) => d.position,
          getElevation: (d) => (is3D ? d.elevation * 1.5 : 0),
          getFillColor: (d) => {
            if (d.isHotspot) {
              const alpha = 180 + Math.sin(pulsePhase) * 50;
              return [255, 25, 65, alpha];
            }
            // Color ramp from healthy green to stressed yellow
            const stress = d.stressLevel;
            const r = Math.min(255, Math.floor(stress * 255 * 1.6));
            const g = Math.max(30, Math.floor((1 - stress * 0.7) * 220));
            const b = 40;
            return [r, g, b, 120];
          },
          pickable: true,
          autoHighlight: true,
          highlightColor: [255, 255, 255, 80]
        })
      );
    }

    // 5. IRRIGATION LINES & HYDRAULIC PATHS
    if (layerVisibility.irrigation) {
      layerList.push(
        new GeoJsonLayer({
          id: "irrigation-lines-layer",
          data: IRRIGATION_LINES_GEOJSON,
          stroked: true,
          getLineColor: [0, 200, 255, 230],
          getLineWidth: 3,
          lineWidthUnits: "pixels",
          pickable: true
        })
      );
    }

    // 6. PREDICTED 5-ACRE DISEASE OUTBREAK HOTSPOT (CRITICAL LAYER)
    if (layerVisibility.blightZone) {
      const pulseGlow = Math.sin(pulsePhase) * 0.5 + 0.5; // 0 to 1
      const alphaFill = Math.floor(140 + pulseGlow * 90);
      const lineWidth = 3 + pulseGlow * 3;

      layerList.push(
        new GeoJsonLayer({
          id: "blight-prediction-zone-layer",
          data: BLIGHT_PREDICTION_ZONE_GEOJSON,
          filled: true,
          stroked: true,
          extruded: is3D && layerVisibility.elevation3D,
          getElevation: 120,
          getFillColor: [255, 10, 60, alphaFill],
          getLineColor: [255, 255, 255, 240],
          getLineWidth: lineWidth,
          lineWidthUnits: "pixels",
          pickable: true,
          autoHighlight: true,
          highlightColor: [255, 255, 255, 90]
        })
      );
    }

    // 7. GROUND IOT RADIOMETER STATIONS (ScatterplotLayer)
    if (layerVisibility.sensors) {
      layerList.push(
        new ScatterplotLayer({
          id: "sensor-stations-layer",
          data: SENSOR_STATIONS,
          getPosition: (d) => d.coordinates,
          getRadius: (d) => (d.status === "ALERT_ANOMALY" ? 65 : 45),
          getFillColor: (d) =>
            d.status === "ALERT_ANOMALY"
              ? [255, 50, 80, 230]
              : [0, 240, 255, 210],
          getLineColor: [255, 255, 255, 255],
          stroked: true,
          lineWidthUnits: "pixels",
          getLineWidth: 2,
          radiusUnits: "meters",
          pickable: true
        })
      );
    }

    // 8. 3D SPATIAL LABELS & SECTOR BILLBOARDS
    if (layerVisibility.labels) {
      const sectorLabels = [
        { text: "SECTOR A\n295 Ac • WARNING", coordinates: [-121.6040, 36.6650], color: [255, 80, 80, 255] },
        { text: "SECTOR B\n285 Ac • OPTIMAL", coordinates: [-121.6160, 36.6650], color: [100, 255, 150, 255] },
        { text: "SECTOR C\n240 Ac • OPTIMAL", coordinates: [-121.6160, 36.6550], color: [100, 255, 150, 255] },
        { text: "SECTOR D\n180 Ac • NORMAL", coordinates: [-121.6040, 36.6550], color: [150, 200, 255, 255] },
        { text: "⚠️ 5-ACRE BLIGHT HOTSPOT\nLead Time: 21 Days Pre-Symptomatic", coordinates: [-121.6042, 36.6680], color: [255, 30, 70, 255] }
      ];

      layerList.push(
        new TextLayer({
          id: "spatial-labels-layer",
          data: sectorLabels,
          getPosition: (d) => d.coordinates,
          getText: (d) => d.text,
          getSize: 13,
          getColor: (d) => d.color,
          getTextAnchor: "middle",
          getAlignmentBaseline: "center",
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          fontWeight: 700,
          background: true,
          backgroundColor: [10, 16, 28, 210],
          backgroundPadding: [6, 4],
          billboard: true
        })
      );
    }

    return layerList;
  }, [
    activeBasemap,
    layerVisibility,
    is3D,
    activeBand,
    mapboxToken,
    pixelGridData,
    pulsePhase
  ]);

  return (
    <div className="terra-map-wrapper">
      {/* Background Mapbox GL Container (active when mapboxToken is provided) */}
      <div
        ref={mapContainerRef}
        className={`mapbox-background-canvas ${mapboxToken ? "active" : "inactive"}`}
      />

      {/* Primary Deck.gl WebGL Canvas */}
      <DeckGL
        initialViewState={viewState}
        viewState={viewState}
        onViewStateChange={({ viewState }) => setViewState(viewState)}
        controller={{
          dragRotate: true,
          dragPan: true,
          scrollZoom: true,
          doubleClickZoom: true,
          touchRotate: true
        }}
        layers={layers}
        onHover={(info) => setHoverInfo(info.object ? info : null)}
        getCursor={({ isHovering }) => (isHovering ? "pointer" : "default")}
      />
    </div>
  );
}
