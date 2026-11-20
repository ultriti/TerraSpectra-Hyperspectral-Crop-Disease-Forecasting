import { useState } from "react";
import {
  ShieldAlert,
  ChevronDown,
  Activity,
  Layers,
  Sprout
} from "lucide-react";

export default function HeatmapStatsBanner({ scenario, onFocusHotspot }) {
  const [isMinimized, setIsMinimized] = useState(false);

  if (!scenario || !scenario.summary) return null;

  const sum = scenario.summary;
  const isCritical = sum.critical_blight_acreage > 0;

  return (
    <div className={`heatmap-stats-banner ${isMinimized ? "minimized" : ""}`}>
      {/* Minimized Pill */}
      {isMinimized ? (
        <button
          className="stats-minimized-pill"
          onClick={() => setIsMinimized(false)}
          title="Expand Heatmap Telemetry"
        >
          <Activity size={14} className="text-cyan" />
          <span>Farm Health: {((sum.healthy_acreage / sum.total_acreage) * 100).toFixed(1)}% Optimal</span>
          {isCritical && (
            <span className="mini-alert-dot"></span>
          )}
          <ChevronDown size={14} style={{ transform: "rotate(180deg)" }} />
        </button>
      ) : (
        <div className="stats-banner-card">
          <div className="stats-banner-header">
            <div className="sbh-left">
              <Layers size={14} className="text-cyan" />
              <span className="sbh-title">Hyperspectral Pixel Heatmap Analytics</span>
              <span className="sbh-scenario">{scenario.name.split("-")[0]}</span>
            </div>

            <div className="sbh-right">
              {isCritical && (
                <button className="sbh-alert-badge" onClick={onFocusHotspot}>
                  <ShieldAlert size={12} className="pulse-icon" />
                  <span>{sum.critical_blight_acreage} Acres High Risk</span>
                </button>
              )}
              <button
                className="sbh-minimize-btn"
                onClick={() => setIsMinimized(true)}
                title="Minimize Telemetry"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          <div className="stats-banner-grid">
            <div className="sbg-col">
              <span className="sbg-lbl">TOTAL MONITORED</span>
              <span className="sbg-val">{sum.total_acreage} Acres</span>
              <span className="sbg-sub">400 Pixel Voxels (30m GSD)</span>
            </div>

            <div className="sbg-col">
              <span className="sbg-lbl">HEALTHY CANOPY</span>
              <span className="sbg-val text-green">{sum.healthy_acreage.toFixed(1)} Ac</span>
              <span className="sbg-sub">{((sum.healthy_acreage / sum.total_acreage) * 100).toFixed(1)}% Area</span>
            </div>

            <div className="sbg-col">
              <span className="sbg-lbl">MODERATE STRESS</span>
              <span className="sbg-val text-warning">{sum.moderate_stress_acreage.toFixed(1)} Ac</span>
              <span className="sbg-sub">Chlorophyll 0.65 - 0.75</span>
            </div>

            <div className="sbg-col">
              <span className="sbg-lbl">PRE-SYMPTOMATIC BLIGHT</span>
              <span className="sbg-val text-danger">{sum.critical_blight_acreage.toFixed(2)} Ac</span>
              <span className="sbg-sub text-danger">21-Day Early Warning</span>
            </div>

            <div className="sbg-col">
              <span className="sbg-lbl">MEAN CHLOROPHYLL</span>
              <span className="sbg-val text-cyan">{sum.mean_chlorophyll.toFixed(3)}</span>
              <span className="sbg-sub">CAI (Chlorophyll Abs Index)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
