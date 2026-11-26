import { AlertTriangle, Activity } from "lucide-react";

export default function Legend({ showBlightZone, activeBand }) {
  return (
    <div className="gis-legend">
      <div className="legend-title">
        <Activity size={14} className="legend-icon" />
        <span>Spectral Disease Forecasting Index</span>
      </div>

      <div className="legend-gradient-bar"></div>
      <div className="legend-labels">
        <span>0.0 (Optimal)</span>
        <span>0.5 (Stressed)</span>
        <span>1.0 (Blight)</span>
      </div>

      <div className="legend-items">
        <div className="legend-item">
          <span className="dot dot-healthy"></span>
          <span>Healthy Canopy (High Chlorophyll &gt; 80%)</span>
        </div>

        <div className="legend-item">
          <span className="dot dot-warning"></span>
          <span>Moderate Chemical Stress (60% - 80%)</span>
        </div>

        {showBlightZone && (
          <div className="legend-item alert-item">
            <span className="dot dot-critical pulse"></span>
            <span className="highlight-critical">
              <AlertTriangle size={12} style={{ display: 'inline', marginRight: 4 }} />
              5-Acre Blight Hotspot (21-Day Early Warning)
            </span>
          </div>
        )}

        <div className="legend-item">
          <span className="line line-canal"></span>
          <span>Irrigation Canals & Manifolds</span>
        </div>

        <div className="legend-item">
          <span className="dot dot-sensor"></span>
          <span>Ground IoT Radiometers (705nm)</span>
        </div>
      </div>

      <div className="legend-meta">
        <div>Band: <strong>{activeBand.label.split("(")[0]}</strong></div>
        <div>Model: <strong>3D-CNN + ViT (30m GSD)</strong></div>
      </div>
    </div>
  );
}
