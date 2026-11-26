import { useState, useRef } from "react";
import {
  UploadCloud,
  FileImage,
  AlertTriangle,
  CheckCircle,
  X,
  Cpu,
  Sparkles,
  MapPin,
  ArrowRight
} from "lucide-react";
import { predictPlantHealth } from "../services/api";

export default function DiseaseAnalyzerModal({
  isOpen,
  onClose,
  backendStatus,
  onFlyToSector
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setErrorMsg(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setErrorMsg(null);
    }
  };

  // Helper to generate a realistic test crop leaf on canvas for one-click testing
  const handleLoadSample = (sampleType) => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");

    // Base leaf gradient
    const grad = ctx.createLinearGradient(0, 0, 256, 256);
    if (sampleType === "blight") {
      grad.addColorStop(0, "#2d5a27");
      grad.addColorStop(0.5, "#4a7c36");
      grad.addColorStop(1, "#315422");
    } else if (sampleType === "bacterial") {
      grad.addColorStop(0, "#3e6b2c");
      grad.addColorStop(1, "#284a1d");
    } else {
      // Healthy
      grad.addColorStop(0, "#10b981");
      grad.addColorStop(0.5, "#059669");
      grad.addColorStop(1, "#047857");
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);

    // Draw leaf shape & veins
    ctx.beginPath();
    ctx.moveTo(128, 20);
    ctx.bezierCurveTo(230, 80, 220, 200, 128, 240);
    ctx.bezierCurveTo(36, 200, 26, 80, 128, 20);
    ctx.fillStyle = sampleType === "healthy" ? "#10b981" : "#3b6b2c";
    ctx.fill();

    // Central vein
    ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(128, 20);
    ctx.lineTo(128, 235);
    ctx.stroke();

    // Side veins
    for (let y = 60; y < 200; y += 30) {
      ctx.beginPath();
      ctx.moveTo(128, y);
      ctx.lineTo(190, y - 15);
      ctx.moveTo(128, y);
      ctx.lineTo(66, y - 15);
      ctx.stroke();
    }

    // Add lesions if diseased
    if (sampleType === "blight") {
      ctx.fillStyle = "rgba(75, 45, 25, 0.85)";
      ctx.beginPath();
      ctx.arc(145, 110, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(180, 140, 50, 0.7)";
      ctx.beginPath();
      ctx.arc(105, 160, 24, 0, Math.PI * 2);
      ctx.fill();
    } else if (sampleType === "bacterial") {
      ctx.fillStyle = "rgba(40, 30, 20, 0.9)";
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.arc(80 + (i * 11) % 90, 70 + (i * 17) % 110, 4 + (i % 3), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${sampleType}_sample.png`, { type: "image/png" });
        setSelectedFile(file);
        setPreviewUrl(canvas.toDataURL());
        setResult(null);
        setErrorMsg(null);
      }
    }, "image/png");
  };

  const handleRunInference = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setErrorMsg(null);

    const res = await predictPlantHealth(selectedFile);
    setAnalyzing(false);

    if (res.success) {
      setResult(res.data);
    } else {
      // Fallback if backend server is not running on localhost:8000
      setErrorMsg(`${res.error}. Ensure backend is running: python -m uvicorn main:app --reload`);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content analyzer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <Cpu size={18} className="analyzer-icon" />
            <div>
              <h3>AI Disease Inference Engine</h3>
              <p className="modal-sub">FastAPI Route: <code>POST /predict_plant_health</code></p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {/* Status Banner */}
          <div className={`backend-status-banner ${backendStatus.online ? "banner-online" : "banner-offline"}`}>
            <span className="indicator-dot"></span>
            <span>
              Backend Server: <strong>{backendStatus.online ? "ONLINE (FastAPI 1.2.0)" : "OFFLINE (Port 8000)"}</strong>
            </span>
          </div>

          {/* Preset Samples */}
          <div className="sample-presets">
            <span className="preset-label">Test Samples:</span>
            <button
              className="preset-btn btn-blight"
              onClick={() => handleLoadSample("blight")}
            >
              Potato Late Blight (Hotspot)
            </button>
            <button
              className="preset-btn btn-bacterial"
              onClick={() => handleLoadSample("bacterial")}
            >
              Tomato Bacterial Spot
            </button>
            <button
              className="preset-btn btn-healthy"
              onClick={() => handleLoadSample("healthy")}
            >
              Healthy Canopy
            </button>
          </div>

          {/* Upload / Drag Area */}
          <div
            className="upload-dropzone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              style={{ display: "none" }}
            />

            {previewUrl ? (
              <div className="preview-container">
                <img src={previewUrl} alt="Crop sample preview" className="leaf-preview" />
                <div className="preview-overlay">
                  <FileImage size={16} />
                  <span>{selectedFile?.name}</span>
                </div>
              </div>
            ) : (
              <div className="dropzone-prompt">
                <UploadCloud size={36} className="upload-icon" />
                <div className="prompt-title">Click to upload or drag & drop crop image</div>
                <div className="prompt-sub">Supports RGB, NIR, and hyperspectral patch captures (PNG, JPEG, TIFF)</div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="analyzer-actions">
            <button
              className="btn-primary analyze-btn"
              disabled={!selectedFile || analyzing}
              onClick={handleRunInference}
            >
              <Sparkles size={16} />
              <span>{analyzing ? "Running Deep Neural Model..." : "Analyze with Backend Model"}</span>
            </button>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="analyzer-error">
              <AlertTriangle size={16} />
              <div>{errorMsg}</div>
            </div>
          )}

          {/* Inference Result Card */}
          {result && (
            <div className={`result-card ${result.is_healthy ? "result-healthy" : "result-disease"}`}>
              <div className="result-top">
                <div className="result-badge-group">
                  {result.is_healthy ? (
                    <span className="badge badge-success"><CheckCircle size={13} /> OPTIMAL</span>
                  ) : (
                    <span className="badge badge-danger"><AlertTriangle size={13} /> {result.severity || "CRITICAL"} THREAT</span>
                  )}
                  <span className="badge badge-sector">Mapped: {result.mapped_sector}</span>
                </div>
                <div className="result-conf">
                  Confidence: <strong>{result.confidence}%</strong>
                </div>
              </div>

              <div className="result-title">
                {result.display_name || result.desease_name}
              </div>

              <div className="conf-progress-bar">
                <div
                  className="conf-progress-fill"
                  style={{
                    width: `${Math.min(result.confidence, 100)}%`,
                    backgroundColor: result.is_healthy ? "#10b981" : "#ff2a55"
                  }}
                />
              </div>

              <div className="result-metrics">
                <div className="rm-item">
                  <span className="rm-lbl">Predicted Class:</span>
                  <span className="rm-val">Class #{result.prediction}</span>
                </div>
                <div className="rm-item">
                  <span className="rm-lbl">Lead Time:</span>
                  <span className="rm-val text-cyan">{result.lead_time || "21 Days Pre-Symptomatic"}</span>
                </div>
                <div className="rm-item">
                  <span className="rm-lbl">Input Dimensions:</span>
                  <span className="rm-val">{result.input_resolution || "256x256"}</span>
                </div>
              </div>

              <div className="result-recommendation">
                <div className="rec-header">AGRONOMIC INTERVENTION:</div>
                <p>{result.recommendation}</p>
              </div>

              {result.mapped_sector && (
                <button
                  className="btn-locate-sector"
                  onClick={() => {
                    const sec = result.mapped_sector.includes("Sector A") ? "A" :
                                result.mapped_sector.includes("Sector B") ? "B" :
                                result.mapped_sector.includes("Sector C") ? "C" : "D";
                    onFlyToSector(sec);
                    onClose();
                  }}
                >
                  <MapPin size={14} />
                  <span>Locate &amp; Fly to {result.mapped_sector} on 3D Map</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
