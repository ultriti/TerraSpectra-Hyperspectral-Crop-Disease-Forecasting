import { useState } from "react";
import {
  Layers,
  Activity,
  AlertTriangle,
  Radio,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Database,
  ShieldAlert,
  Sprout,
  Compass,
  Cpu,
  Sparkles,
  Server
} from "lucide-react";
import { BASEMAP_STYLES, SPECTRAL_BANDS, SYSTEM_SPECS } from "../data/constants";
import { SENSOR_STATIONS, BLIGHT_PREDICTION_ZONE_GEOJSON } from "../data/farmData";

export default function Sidebar({
  layerVisibility,
  setLayerVisibility,
  activeBasemap,
  setActiveBasemap,
  activeBand,
  setActiveBand,
  onFocusBlight,
  onFocusSector,
  onOpenAnalyzer,
  backendStatus
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("layers"); // 'layers' | 'diagnostics' | 'spectral' | 'sensors'

  const blightData = BLIGHT_PREDICTION_ZONE_GEOJSON.features[0].properties;

  const toggleLayer = (layerKey) => {
    setLayerVisibility(prev => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  return (
    <aside className={`terra-sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <button
        className="collapse-toggle"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expand Panel" : "Collapse Panel"}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {!isCollapsed && (
        <div className="sidebar-inner">
          {/* Navigation Tabs */}
          <div className="sidebar-tabs">
            <button
              className={`tab-btn ${activeTab === "layers" ? "active" : ""}`}
              onClick={() => setActiveTab("layers")}
              title="Geospatial Layers"
            >
              <Layers size={16} />
              <span>Layers</span>
            </button>

            <button
              className={`tab-btn alert-tab ${activeTab === "diagnostics" ? "active" : ""}`}
              onClick={() => setActiveTab("diagnostics")}
              title="Disease Forecast"
            >
              <AlertTriangle size={16} />
              <span>Forecast</span>
              <span className="tab-bubble">1</span>
            </button>

            <button
              className={`tab-btn ${activeTab === "spectral" ? "active" : ""}`}
              onClick={() => setActiveTab("spectral")}
              title="Spectral Bands"
            >
              <Sliders size={16} />
              <span>Spectra</span>
            </button>

            <button
              className={`tab-btn ${activeTab === "sensors" ? "active" : ""}`}
              onClick={() => setActiveTab("sensors")}
              title="IoT Telemetry"
            >
              <Radio size={16} />
              <span>IoT</span>
            </button>
          </div>

          {/* TAB 1: GIS LAYERS */}
          {activeTab === "layers" && (
            <div className="tab-pane">
              <div className="section-title">
                <Compass size={14} />
                <span>Base Map Architecture</span>
              </div>

              <div className="basemap-selector">
                {BASEMAP_STYLES.map((style) => (
                  <button
                    key={style.id}
                    className={`basemap-card ${activeBasemap.id === style.id ? "selected" : ""}`}
                    onClick={() => setActiveBasemap(style)}
                  >
                    <div className="basemap-card-title">{style.name}</div>
                    <div className="basemap-card-desc">{style.description}</div>
                  </button>
                ))}
              </div>

              <div className="section-title">
                <Layers size={14} />
                <span>Farm Geospatial Layers</span>
              </div>

              <div className="layer-toggle-list">
                <label className="layer-toggle-item">
                  <input
                    type="checkbox"
                    checked={layerVisibility.farmBoundary}
                    onChange={() => toggleLayer("farmBoundary")}
                  />
                  <div className="toggle-label-group">
                    <span className="toggle-name">1,000-Acre Farm Boundary</span>
                    <span className="toggle-sub">Outer perimeter &amp; cadastral border</span>
                  </div>
                </label>

                <label className="layer-toggle-item">
                  <input
                    type="checkbox"
                    checked={layerVisibility.sectors}
                    onChange={() => toggleLayer("sectors")}
                  />
                  <div className="toggle-label-group">
                    <span className="toggle-name">Sectors &amp; Parcels (A, B, C, D)</span>
                    <span className="toggle-sub">Romaine, Berries, Brassicas, Celery</span>
                  </div>
                </label>

                <label className="layer-toggle-item critical-toggle">
                  <input
                    type="checkbox"
                    checked={layerVisibility.blightZone}
                    onChange={() => toggleLayer("blightZone")}
                  />
                  <div className="toggle-label-group">
                    <span className="toggle-name highlight-red">5-Acre Blight Hotspot</span>
                    <span className="toggle-sub">3-week pre-symptomatic fungal prediction</span>
                  </div>
                </label>

                <label className="layer-toggle-item">
                  <input
                    type="checkbox"
                    checked={layerVisibility.pixelGrid}
                    onChange={() => toggleLayer("pixelGrid")}
                  />
                  <div className="toggle-label-group">
                    <span className="toggle-name">30m Hyperspectral Pixel Grid</span>
                    <span className="toggle-sub">Normalized biochemical reflectance cells</span>
                  </div>
                </label>

                <label className="layer-toggle-item">
                  <input
                    type="checkbox"
                    checked={layerVisibility.elevation3D}
                    onChange={() => toggleLayer("elevation3D")}
                  />
                  <div className="toggle-label-group">
                    <span className="toggle-name">3D Height Extrusions</span>
                    <span className="toggle-sub">Canopy height &amp; stress elevation profiles</span>
                  </div>
                </label>

                <label className="layer-toggle-item">
                  <input
                    type="checkbox"
                    checked={layerVisibility.irrigation}
                    onChange={() => toggleLayer("irrigation")}
                  />
                  <div className="toggle-label-group">
                    <span className="toggle-name">Irrigation &amp; Canal Network</span>
                    <span className="toggle-sub">Main canals and sub-surface manifolds</span>
                  </div>
                </label>

                <label className="layer-toggle-item">
                  <input
                    type="checkbox"
                    checked={layerVisibility.sensors}
                    onChange={() => toggleLayer("sensors")}
                  />
                  <div className="toggle-label-group">
                    <span className="toggle-name">Ground IoT Radiometer Stations</span>
                    <span className="toggle-sub">Real-time spectral calibration beacons</span>
                  </div>
                </label>

                <label className="layer-toggle-item">
                  <input
                    type="checkbox"
                    checked={layerVisibility.labels}
                    onChange={() => toggleLayer("labels")}
                  />
                  <div className="toggle-label-group">
                    <span className="toggle-name">Sector Labels (3D Text)</span>
                    <span className="toggle-sub">Spatial names &amp; acreage callouts</span>
                  </div>
                </label>
              </div>

              {/* Quick Jump to Sectors */}
              <div className="section-title">
                <Sprout size={14} />
                <span>Sector Quick Navigator</span>
              </div>
              <div className="sector-chips">
                <button className="sector-chip chip-a" onClick={() => onFocusSector("A")}>
                  Sector A (295 ac) • Warning
                </button>
                <button className="sector-chip" onClick={() => onFocusSector("B")}>
                  Sector B (285 ac) • Optimal
                </button>
                <button className="sector-chip" onClick={() => onFocusSector("C")}>
                  Sector C (240 ac) • Optimal
                </button>
                <button className="sector-chip" onClick={() => onFocusSector("D")}>
                  Sector D (180 ac) • Normal
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: DISEASE FORECASTING */}
          {activeTab === "diagnostics" && (
            <div className="tab-pane">
              {/* Backend Model Integration Banner */}
              <div className="backend-callout-card">
                <div className="callout-header">
                  <Cpu size={15} className="callout-icon" />
                  <span>FastAPI Inference Route Active</span>
                </div>
                <p className="callout-desc">
                  Direct connection to backend endpoint <code>/predict_plant_health</code>. Analyzes uploaded leaf imagery or hyperspectral spectral patches.
                </p>
                <button className="btn-callout-analyzer" onClick={onOpenAnalyzer}>
                  <Sparkles size={14} />
                  <span>Test Image with Backend Model</span>
                </button>
              </div>

              <div className="alert-card-hero">
                <div className="alert-hero-top">
                  <ShieldAlert size={20} className="alert-hero-icon" />
                  <div>
                    <div className="alert-hero-title">CRITICAL EARLY DETECTION</div>
                    <div className="alert-hero-subtitle">Target: Sector A, Zone Alpha-9</div>
                  </div>
                </div>

                <div className="alert-hero-body">
                  <div className="hero-metric-grid">
                    <div className="hero-metric">
                      <span className="m-label">AFFECTED AREA</span>
                      <span className="m-value text-danger">{blightData.acreage} Acres</span>
                    </div>
                    <div className="hero-metric">
                      <span className="m-label">FORECAST LEAD TIME</span>
                      <span className="m-value text-accent">21 Days (3 Wks)</span>
                    </div>
                    <div className="hero-metric">
                      <span className="m-label">AI CONFIDENCE</span>
                      <span className="m-value">{blightData.confidenceScore}</span>
                    </div>
                    <div className="hero-metric">
                      <span className="m-label">SYMPTOM STAGE</span>
                      <span className="m-value text-warning">Pre-Symptomatic</span>
                    </div>
                  </div>

                  <div className="threat-summary">
                    <strong>Pathogen:</strong> {blightData.threat}
                  </div>

                  <div className="threat-summary">
                    <strong>Spectral Anomaly:</strong> {blightData.detectedBandShift}
                  </div>

                  <div className="action-recommendation">
                    <div className="action-tag">PREVENTATIVE INTERVENTION</div>
                    <p>{blightData.recommendedAction}</p>
                  </div>

                  <button className="btn-action-primary" onClick={onFocusBlight}>
                    Fly Camera to 5-Acre Hotspot
                  </button>
                </div>
              </div>

              <div className="section-title">
                <Activity size={14} />
                <span>Detection Advantage Comparison</span>
              </div>

              <div className="comparison-box">
                <div className="comp-row">
                  <div className="comp-col col-bad">
                    <span className="comp-tag">Standard RGB / 2D-CNN</span>
                    <p>Detects yellow/brown necrosis only at <strong>Day 28+</strong> (Too late; harvest destroyed).</p>
                  </div>
                  <div className="comp-col col-good">
                    <span className="comp-tag">TerraSpectra (3D-CNN + ViT)</span>
                    <p>Detects chlorophyll collapse at <strong>Day 7</strong> (3 weeks prior to visible necrosis).</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HYPERSPECTRAL SPECTRAL BANDS */}
          {activeTab === "spectral" && (
            <div className="tab-pane">
              <div className="section-title">
                <Sliders size={14} />
                <span>200+ Spectral Band Selector</span>
              </div>

              <p className="tab-desc">
                Hyperspectral cubes capture continuous narrow bands across the electromagnetic spectrum, 
                revealing biochemical leaf signatures impossible to see in RGB.
              </p>

              <div className="band-list">
                {SPECTRAL_BANDS.map((band) => (
                  <div
                    key={band.id}
                    className={`band-card ${activeBand.id === band.id ? "active-band" : ""}`}
                    onClick={() => setActiveBand(band)}
                  >
                    <div className="band-top">
                      <span className="band-label">{band.label}</span>
                      <span className="band-wave">{band.wavelength}</span>
                    </div>
                    <div className="band-sensor">{band.sensor}</div>
                    <div className="band-desc">{band.description}</div>
                  </div>
                ))}
              </div>

              <div className="tech-badge-container">
                <div className="tech-item">
                  <span className="t-lbl">DIMENSIONALITY REDUCTION:</span>
                  <span className="t-val">Incremental PCA (220 -&gt; 32 Components)</span>
                </div>
                <div className="tech-item">
                  <span className="t-lbl">BACKEND MODEL:</span>
                  <span className="t-val">{SYSTEM_SPECS.model}</span>
                </div>
                <div className="tech-item">
                  <span className="t-lbl">MODEL CLASSES:</span>
                  <span className="t-val">16 Disease &amp; Health Categories</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: IOT SENSORS */}
          {activeTab === "sensors" && (
            <div className="tab-pane">
              <div className="section-title">
                <Radio size={14} />
                <span>Ground Validation Telemetry</span>
              </div>

              <div className="sensor-list">
                {SENSOR_STATIONS.map((sensor) => (
                  <div
                    key={sensor.id}
                    className={`sensor-card ${sensor.status === "ALERT_ANOMALY" ? "sensor-alert" : ""}`}
                  >
                    <div className="sensor-header">
                      <div className="sensor-name">
                        <Radio size={14} className="sensor-icon" />
                        <span>{sensor.name}</span>
                      </div>
                      <span className={`sensor-status-tag ${sensor.status === "ALERT_ANOMALY" ? "tag-alert" : "tag-ok"}`}>
                        {sensor.status === "ALERT_ANOMALY" ? "ANOMALY" : "STABLE"}
                      </span>
                    </div>

                    <div className="sensor-grid">
                      <div className="sg-item">
                        <span className="sg-lbl">Red-Edge (705nm):</span>
                        <span className={`sg-val ${sensor.spectralReflectanceB705 < 0.5 ? "text-danger" : ""}`}>
                          {sensor.spectralReflectanceB705}
                        </span>
                      </div>
                      <div className="sg-item">
                        <span className="sg-lbl">Soil Moisture:</span>
                        <span className="sg-val">{sensor.soilMoisture}</span>
                      </div>
                      <div className="sg-item">
                        <span className="sg-lbl">Air Temp:</span>
                        <span className="sg-val">{sensor.airTempC}°C</span>
                      </div>
                      <div className="sg-item">
                        <span className="sg-lbl">Humidity:</span>
                        <span className="sg-val">{sensor.humidity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="sidebar-footer">
            <div className="footer-pipeline">
              <Database size={13} />
              <span>Pipeline: Rasterio + GDAL + PyTorch GPU</span>
            </div>
            <div className="footer-backend-sync">
              <Server size={12} />
              <span>
                Backend API: {backendStatus?.online ? "Connected (1.2.0)" : "Standalone Mode"}
              </span>
            </div>
            <div className="footer-version">TerraSpectra {SYSTEM_SPECS.version}</div>
          </div>
        </div>
      )}
    </aside>
  );
}
