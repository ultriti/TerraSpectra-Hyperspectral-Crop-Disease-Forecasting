import {
  X,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Zap,
  Droplets,
  TrendingDown,
  Navigation
} from "lucide-react";

export default function PixelInspectorHUD({
  selectedPixel,
  onClose,
  onCenterPixel
}) {
  if (!selectedPixel) return null;

  const d = selectedPixel;
  const sig = d.spectral_signature || {};

  // Bands for the SVG hyperspectral reflectance spectrum
  const wavelengths = [
    { key: "b480_blue", nm: "480nm", label: "Blue", ref: 0.06 },
    { key: "b560_green", nm: "560nm", label: "Green", ref: 0.18 },
    { key: "b680_red_abs", nm: "680nm", label: "Red Abs", ref: 0.08 },
    { key: "b705_red_edge", nm: "705nm", label: "Red-Edge", ref: 0.78 },
    { key: "b740_nir_shoulder", nm: "740nm", label: "Shoulder", ref: 0.88 },
    { key: "b850_nir_plateau", nm: "850nm", label: "NIR Plate", ref: 0.90 },
    { key: "b1650_swir_water", nm: "1650nm", label: "SWIR", ref: 0.22 }
  ];

  // SVG Chart dimensions
  const svgWidth = 280;
  const svgHeight = 90;
  const paddingX = 25;
  const paddingY = 12;

  // Calculate coordinates for reference and observed curves
  const getPoints = (isObserved) => {
    return wavelengths
      .map((w, index) => {
        const x = paddingX + (index / (wavelengths.length - 1)) * (svgWidth - paddingX * 2);
        const val = isObserved ? (sig[w.key] ?? w.ref) : w.ref;
        const y = svgHeight - paddingY - val * (svgHeight - paddingY * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");
  };

  const refPoints = getPoints(false);
  const obsPoints = getPoints(true);

  const isBlight = d.status === "CRITICAL_BLIGHT" || d.disease_risk >= 0.75;
  const isWarning = d.status === "MODERATE_STRESS" || (d.disease_risk >= 0.4 && d.disease_risk < 0.75);

  return (
    <div className="pixel-inspector-hud">
      <div className="inspector-header">
        <div className="inspector-title-group">
          <Activity size={16} className="inspector-icon" />
          <div>
            <div className="pixel-id-title">Pixel {d.cell_id}</div>
            <div className="pixel-sub-info">{d.sector} • {d.crop}</div>
          </div>
        </div>
        <div className="inspector-actions">
          <button
            className="btn-center-pixel"
            onClick={() => onCenterPixel(d.coordinates)}
            title="Center Camera on this Pixel"
          >
            <Navigation size={13} />
          </button>
          <button className="btn-close-hud" onClick={onClose} title="Close Inspector">
            <X size={15} />
          </button>
        </div>
      </div>

      <div className="inspector-body">
        {/* Status Badge */}
        <div className="inspector-badge-row">
          {isBlight ? (
            <span className="badge badge-danger">
              <AlertTriangle size={12} /> CRITICAL BLIGHT
            </span>
          ) : isWarning ? (
            <span className="badge badge-warning">
              <AlertTriangle size={12} /> MODERATE STRESS
            </span>
          ) : (
            <span className="badge badge-success">
              <CheckCircle2 size={12} /> HEALTHY CANOPY
            </span>
          )}

          <span className="badge-confidence">
            Confidence: <strong>{((d.confidence || 0.94) * 100).toFixed(1)}%</strong>
          </span>
        </div>

        {/* Metric Cards Grid */}
        <div className="inspector-metrics-grid">
          <div className="metric-box">
            <span className="m-title">DISEASE RISK</span>
            <span className={`m-num ${isBlight ? "text-danger" : isWarning ? "text-warning" : "text-green"}`}>
              {((d.disease_risk || 0) * 100).toFixed(1)}%
            </span>
            <div className="mini-meter">
              <div
                className="mini-meter-fill"
                style={{
                  width: `${(d.disease_risk || 0) * 100}%`,
                  backgroundColor: isBlight ? "#ff2a55" : isWarning ? "#f59e0b" : "#00ff88"
                }}
              />
            </div>
          </div>

          <div className="metric-box">
            <span className="m-title">CHLOROPHYLL INDEX</span>
            <span className="m-num">
              {(d.chlorophyll_index || 0).toFixed(2)}
            </span>
            <span className="m-sub">
              {d.chlorophyll_index < 0.6 ? "-28% vs Healthy" : "Normal"}
            </span>
          </div>

          <div className="metric-box">
            <span className="m-title">RED-EDGE SLOPE</span>
            <span className="m-num text-cyan">
              {(d.red_edge_slope || 0).toFixed(2)}
            </span>
            <span className="m-sub">705nm - 740nm</span>
          </div>

          <div className="metric-box">
            <span className="m-title">WATER STRESS</span>
            <span className="m-num">
              {(d.water_stress_index || 0).toFixed(2)}
            </span>
            <span className="m-sub">SWIR 1650nm</span>
          </div>
        </div>

        {/* Hyperspectral 7-Band Reflectance Chart */}
        <div className="spectrum-chart-container">
          <div className="spectrum-header">
            <span className="spec-title">HYPERSPECTRAL REFLECTANCE CURVE</span>
            <div className="spec-legend">
              <span className="legend-ref">Reference</span>
              <span className="legend-obs">Observed Pixel</span>
            </div>
          </div>

          <svg width={svgWidth} height={svgHeight} className="spectrum-svg">
            {/* Grid lines */}
            <line x1={paddingX} y1={svgHeight - paddingY} x2={svgWidth - paddingX} y2={svgHeight - paddingY} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <line x1={paddingX} y1={paddingY} x2={svgWidth - paddingX} y2={paddingY} stroke="rgba(255,255,255,0.08)" strokeDasharray="3 3" />

            {/* Reference Healthy Line (Green dotted) */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="1.8"
              strokeDasharray="4 3"
              points={refPoints}
            />

            {/* Observed Pixel Line (Cyan or Red depending on health) */}
            <polyline
              fill="none"
              stroke={isBlight ? "#ff2a55" : isWarning ? "#f59e0b" : "#00f0ff"}
              strokeWidth="2.2"
              points={obsPoints}
            />

            {/* Points on Observed Line */}
            {wavelengths.map((w, index) => {
              const x = paddingX + (index / (wavelengths.length - 1)) * (svgWidth - paddingX * 2);
              const val = sig[w.key] ?? w.ref;
              const y = svgHeight - paddingY - val * (svgHeight - paddingY * 2);
              return (
                <circle
                  key={w.key}
                  cx={x}
                  cy={y}
                  r="3.5"
                  fill={isBlight ? "#ff2a55" : isWarning ? "#f59e0b" : "#00f0ff"}
                  stroke="#0a0e17"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>

          {/* Wavelength Labels */}
          <div className="wavelength-ticks">
            {wavelengths.map((w) => (
              <span key={w.key} className="w-tick">{w.nm}</span>
            ))}
          </div>
        </div>

        {/* Early Warning Note & Recommendation */}
        {isBlight ? (
          <div className="inspector-alert-card">
            <div className="iac-title">
              <Zap size={13} className="iac-icon" />
              <span>3-WEEK PRE-SYMPTOMATIC BLIGHT FORECAST</span>
            </div>
            <p className="iac-desc">
              Severe red-edge attenuation detected at 705nm with photochemical reflectance index anomaly. Foliage appears 100% green to human eye, but fungal hyphae have colonized mesophyll.
            </p>
            <div className="iac-action">
              <strong>Intervention:</strong> Dispatch precision bio-fungicide UAV to GPS: {d.coordinates[1].toFixed(4)}°N, {Math.abs(d.coordinates[0]).toFixed(4)}°W.
            </div>
          </div>
        ) : (
          <div className="inspector-healthy-card">
            <CheckCircle2 size={14} className="ihc-icon" />
            <span>Optimal vegetative canopy vigor. Chlorophyll absorption peak intact at 680nm.</span>
          </div>
        )}

        {/* GPS Footer */}
        <div className="inspector-footer">
          <MapPin size={11} />
          <span>Coordinates: {d.coordinates[1].toFixed(5)}°N, {Math.abs(d.coordinates[0]).toFixed(5)}°W (30m GSD Cell)</span>
        </div>
      </div>
    </div>
  );
}
