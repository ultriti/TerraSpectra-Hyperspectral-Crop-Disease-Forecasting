import React, { useState } from "react";
import { Satellite, ShieldAlert, Cpu, Layers, Sparkles, Key, Check } from "lucide-react";

export default function Header({ onFocusBlight, onResetView, mapboxToken, setMapboxToken }) {
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tempToken, setTempToken] = useState(mapboxToken || "");

  const handleSaveToken = (e) => {
    e.preventDefault();
    setMapboxToken(tempToken);
    setShowTokenModal(false);
  };

  return (
    <header className="terra-header">
      <div className="header-left">
        <div className="logo-container" onClick={onResetView} role="button" tabIndex={0}>
          <div className="logo-icon-pulse">
            <Satellite size={22} className="logo-sat" />
          </div>
          <div className="brand-titles">
            <div className="brand-name">
              TERRA<span className="brand-highlight">SPECTRA</span>
            </div>
            <div className="brand-subtitle">
              HYPERSPECTRAL CROP DISEASE FORECASTING ENGINE
            </div>
          </div>
        </div>

        <div className="mission-badge">
          <span className="live-indicator"></span>
          <span>NASA EO-1 HYPERION / SENTINEL-2 SYNC</span>
        </div>
      </div>

      <div className="header-center">
        <div className="stat-pill">
          <span className="pill-label">MONITORED REGION:</span>
          <span className="pill-val">Salinas Valley, CA (1,000 Acres)</span>
        </div>
        <div className="stat-pill">
          <span className="pill-label">SPECTRAL CHANNELS:</span>
          <span className="pill-val">220 Bands (400-2500nm)</span>
        </div>
        <div className="stat-pill warning-pill" onClick={onFocusBlight} role="button" tabIndex={0}>
          <ShieldAlert size={14} className="pulse-icon" />
          <span className="pill-label">EARLY WARNING:</span>
          <span className="pill-val-alert">5-Acre Blight Hotspot Detected</span>
        </div>
      </div>

      <div className="header-right">
        <button
          className="header-token-btn"
          onClick={() => setShowTokenModal(true)}
          title="Configure Mapbox Access Token"
        >
          <Key size={14} />
          <span>{mapboxToken ? "Mapbox Active" : "ESRI Satellite Mode"}</span>
        </button>

        <button className="cta-hotspot-btn" onClick={onFocusBlight}>
          <Sparkles size={15} />
          <span>Inspect 5-Ac Blight Zone</span>
        </button>
      </div>

      {showTokenModal && (
        <div className="modal-backdrop" onClick={() => setShowTokenModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Mapbox GL Integration Settings</h3>
              <button className="modal-close" onClick={() => setShowTokenModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p className="modal-desc">
                TerraSpectra is integrated with <strong>Deck.gl &amp; Mapbox GL</strong>. By default, it renders high-resolution 
                ESRI satellite topography with zero token required. You can also paste your own Mapbox public token 
                (<code>pk.eyJ...</code>) to unlock Mapbox Vector, Dark, and 3D Terrain styles.
              </p>

              <form onSubmit={handleSaveToken}>
                <div className="input-group">
                  <label htmlFor="mbToken">Mapbox Public Access Token:</label>
                  <input
                    id="mbToken"
                    type="text"
                    placeholder="pk.eyJ1..."
                    value={tempToken}
                    onChange={(e) => setTempToken(e.target.value)}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setTempToken("");
                      setMapboxToken("");
                      setShowTokenModal(false);
                    }}
                  >
                    Use Open ESRI Satellite
                  </button>
                  <button type="submit" className="btn-primary">
                    <Check size={14} /> Save Token
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
