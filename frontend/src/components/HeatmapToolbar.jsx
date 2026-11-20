import { useState } from "react";
import {
  Layers,
  Sliders,
  Flame,
  ChevronDown,
  Box,
  Eye,
  Filter,
  Sparkles,
  Clock,
  Gauge
} from "lucide-react";
import { HEATMAP_COLOR_PALETTES } from "../data/mockHeatmapResponses";

export default function HeatmapToolbar({
  scenarios,
  activeScenarioKey,
  setActiveScenarioKey,
  activePaletteKey,
  setActivePaletteKey,
  riskThreshold,
  setRiskThreshold,
  gridOpacity,
  setGridOpacity,
  is3DExtruded,
  setIs3DExtruded,
  elevationScale,
  setElevationScale,
  onFocusHotspot
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeScenario = scenarios[activeScenarioKey];
  const activePalette = HEATMAP_COLOR_PALETTES[activePaletteKey];

  return (
    <div className={`heatmap-toolbar ${isExpanded ? "expanded" : ""}`}>
      {/* Primary Bar */}
      <div className="toolbar-main-row">
        <div className="toolbar-badge">
          <Flame size={16} className="flame-icon" />
          <span className="badge-text">3D HEATMAP ENGINE</span>
        </div>

        {/* Scenario Selector Dropdown */}
        <div className="toolbar-control-group">
          <Clock size={13} className="ctrl-icon" />
          <select
            className="scenario-dropdown"
            value={activeScenarioKey}
            onChange={(e) => setActiveScenarioKey(e.target.value)}
          >
            {Object.keys(scenarios).map((key) => (
              <option key={key} value={key}>
                {scenarios[key].name}
              </option>
            ))}
          </select>
        </div>

        {/* Palette Selector Dropdown */}
        <div className="toolbar-control-group">
          <Layers size={13} className="ctrl-icon" />
          <select
            className="palette-dropdown"
            value={activePaletteKey}
            onChange={(e) => setActivePaletteKey(e.target.value)}
          >
            {Object.keys(HEATMAP_COLOR_PALETTES).map((key) => (
              <option key={key} value={key}>
                {HEATMAP_COLOR_PALETTES[key].name}
              </option>
            ))}
          </select>
        </div>

        {/* 3D Voxel Extrusion Toggle */}
        <button
          className={`toolbar-btn-toggle ${is3DExtruded ? "active" : ""}`}
          onClick={() => setIs3DExtruded(!is3DExtruded)}
          title={is3DExtruded ? "Switch to 2D Flat Pixel Grid" : "Switch to 3D Extruded Voxels"}
        >
          <Box size={14} />
          <span>{is3DExtruded ? "3D Voxels" : "2D Tiles"}</span>
        </button>

        {/* Quick Focus Hotspot */}
        <button
          className="toolbar-btn-alert"
          onClick={onFocusHotspot}
          title="Isolate 5-Acre Fungal Blight Hotspot"
        >
          <Sparkles size={13} />
          <span>Isolate Hotspot</span>
        </button>

        {/* Expand / Collapse Slider Controls */}
        <button
          className={`toolbar-btn-expand ${isExpanded ? "active" : ""}`}
          onClick={() => setIsExpanded(!isExpanded)}
          title="Toggle Grid Parameters (Threshold, Opacity, Elevation)"
        >
          <Sliders size={14} />
          <ChevronDown
            size={13}
            style={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease"
            }}
          />
        </button>
      </div>

      {/* Expanded Controls Drawer */}
      {isExpanded && (
        <div className="toolbar-expanded-drawer">
          <div className="drawer-grid">
            {/* Risk Threshold Slider */}
            <div className="slider-card">
              <div className="slider-header">
                <span className="slider-title">
                  <Filter size={12} />
                  <span>Risk Anomaly Threshold</span>
                </span>
                <span className="slider-value">
                  {riskThreshold > 0 ? `> ${(riskThreshold * 100).toFixed(0)}% Risk` : "All Pixels"}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.85"
                step="0.05"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(parseFloat(e.target.value))}
                className="custom-range range-risk"
              />
              <div className="slider-labels">
                <span>0% (All Pixels)</span>
                <span>50% (Stress)</span>
                <span>85% (Critical Only)</span>
              </div>
            </div>

            {/* Grid Opacity Slider */}
            <div className="slider-card">
              <div className="slider-header">
                <span className="slider-title">
                  <Eye size={12} />
                  <span>Overlay Opacity</span>
                </span>
                <span className="slider-value">{Math.round(gridOpacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.05"
                value={gridOpacity}
                onChange={(e) => setGridOpacity(parseFloat(e.target.value))}
                className="custom-range"
              />
              <div className="slider-labels">
                <span>20% (Subtle)</span>
                <span>60% (Balanced)</span>
                <span>100% (Solid)</span>
              </div>
            </div>

            {/* 3D Elevation Scale Multiplier */}
            {is3DExtruded && (
              <div className="slider-card">
                <div className="slider-header">
                  <span className="slider-title">
                    <Gauge size={12} />
                    <span>3D Height Multiplier</span>
                  </span>
                  <span className="slider-value">{elevationScale.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="3.0"
                  step="0.2"
                  value={elevationScale}
                  onChange={(e) => setElevationScale(parseFloat(e.target.value))}
                  className="custom-range"
                />
                <div className="slider-labels">
                  <span>0.5x (Subtle)</span>
                  <span>1.5x (Standard)</span>
                  <span>3.0x (Dramatic)</span>
                </div>
              </div>
            )}
          </div>

          {/* Active Palette Gradient Preview */}
          <div className="palette-preview-bar">
            <span className="p-unit">{activePalette.unit}:</span>
            <span className="p-min">{activePalette.minLabel}</span>
            <div
              className="p-grad"
              style={{ background: activePalette.gradientCss }}
            />
            <span className="p-max">{activePalette.maxLabel}</span>
          </div>

          <div className="scenario-meta-line">
            <span>Swath: <strong>{activeScenario.satellite_swath}</strong></span>
            <span>Scan Time: <strong>{activeScenario.timestamp}</strong></span>
            <span>Forecast Lead: <strong className="text-accent">{activeScenario.lead_time}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
