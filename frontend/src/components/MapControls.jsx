import { Plus, Minus, Compass, Box, MapPin, RotateCcw } from "lucide-react";

export default function MapControls({
  viewState,
  setViewState,
  onResetView,
  onFocusBlight,
  is3D,
  setIs3D
}) {
  const handleZoomIn = () => {
    setViewState(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.8, 20)
    }));
  };

  const handleZoomOut = () => {
    setViewState(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.8, 10)
    }));
  };

  const handleResetBearing = () => {
    setViewState(prev => ({
      ...prev,
      bearing: 0
    }));
  };

  const handleToggle3DPitch = () => {
    setIs3D(!is3D);
    setViewState(prev => ({
      ...prev,
      pitch: is3D ? 0 : 55
    }));
  };

  return (
    <div className="map-hud-controls">
      <div className="hud-button-group">
        <button
          className="hud-btn"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <Plus size={18} />
        </button>

        <button
          className="hud-btn"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <Minus size={18} />
        </button>

        <button
          className={`hud-btn ${viewState.bearing !== 0 ? "active" : ""}`}
          onClick={handleResetBearing}
          title="Reset Compass (North Up)"
        >
          <Compass
            size={18}
            style={{
              transform: `rotate(${-viewState.bearing}deg)`,
              transition: "transform 0.2s ease"
            }}
          />
        </button>

        <button
          className={`hud-btn ${is3D ? "active-accent" : ""}`}
          onClick={handleToggle3DPitch}
          title={is3D ? "Switch to 2D Top-Down View" : "Switch to 3D Oblique View"}
        >
          <Box size={18} />
        </button>

        <button
          className="hud-btn"
          onClick={onResetView}
          title="Reset to 1,000-Acre Farm Overview"
        >
          <RotateCcw size={16} />
        </button>

        <button
          className="hud-btn btn-danger-alert"
          onClick={onFocusBlight}
          title="Focus on 5-Acre Blight Hotspot (Zone Alpha-9)"
        >
          <MapPin size={18} />
          <span className="hud-badge">5-ACRE HOTSPOT</span>
        </button>
      </div>

      <div className="hud-telemetry">
        <div className="hud-metric">
          <span className="lbl">ALT / ZOOM</span>
          <span className="val">{viewState.zoom.toFixed(1)}x</span>
        </div>
        <div className="hud-metric">
          <span className="lbl">PITCH</span>
          <span className="val">{viewState.pitch.toFixed(0)}°</span>
        </div>
        <div className="hud-metric">
          <span className="lbl">BEARING</span>
          <span className="val">{viewState.bearing.toFixed(0)}°</span>
        </div>
      </div>
    </div>
  );
}
