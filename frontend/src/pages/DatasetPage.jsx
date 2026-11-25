/**
 * DatasetPage.jsx — Hyperspectral Dataset Management
 * Upload .npz cube files and inspect dataset metadata.
 */
import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Upload, Database, CheckCircle2, AlertTriangle,
  Loader, ArrowRight, FileText, Layers
} from "lucide-react";
import { uploadDataset, fetchDataset } from "../services/api";

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="info-row">
      <span className="info-row-label">{label}</span>
      <span className={`info-row-value ${mono ? "mono" : ""}`}>{value ?? "—"}</span>
    </div>
  );
}

function DatasetCard({ data }) {
  if (!data) return null;
  return (
    <div className="dataset-card">
      <div className="dc-header">
        <Database size={15} className="dc-icon" />
        <span className="dc-title">{data.name ?? data.id}</span>
        {data.demo_notice && <span className="demo-badge">DEMO</span>}
        <span className={`status-badge ${data.status === "ready" ? "ready" : "pending"}`}>
          {(data.status ?? "unknown").toUpperCase()}
        </span>
      </div>
      <div className="dc-body">
        <InfoRow label="ID"            value={data.id} mono />
        <InfoRow label="Shape (H×W×B)" value={data.shape ? `${data.shape[0]}×${data.shape[1]}×${data.shape[2]}` : "—"} mono />
        <InfoRow label="Spectral Bands" value={data.bands} />
        <InfoRow label="Total Pixels"  value={data.total_pixels?.toLocaleString()} />
        {data.label_distribution && (
          <>
            <InfoRow label="Healthy Pixels"  value={data.label_distribution.healthy?.toLocaleString()} />
            <InfoRow label="Stressed Pixels" value={data.label_distribution.stressed?.toLocaleString()} />
          </>
        )}
        {data.uploaded_at && <InfoRow label="Uploaded" value={new Date(data.uploaded_at).toLocaleString()} />}
        {data.demo_notice && (
          <div className="demo-notice mt-8">
            <AlertTriangle size={12} />
            <span>{data.demo_notice}</span>
          </div>
        )}
      </div>
      <div className="dc-footer">
        <Link to="/predict" className="btn-action btn-primary btn-sm">
          Run Prediction <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  );
}

export default function DatasetPage() {
  const [uploadStatus, setUploadStatus] = useState(null); // null | loading | success | error
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedDataset, setUploadedDataset] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [demoDataset, setDemoDataset] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);
  const fileRef = useRef(null);

  const loadDemo = async () => {
    setDemoLoading(true);
    const result = await fetchDataset("demo");
    if (result.success) setDemoDataset(result.data);
    setDemoLoading(false);
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".npz")) {
      setUploadError("Only .npz hyperspectral cube files are supported.");
      setUploadStatus("error");
      return;
    }

    setUploadStatus("loading");
    setUploadProgress(0);
    setUploadError(null);
    setUploadedDataset(null);

    const result = await uploadDataset(file, (pct) => setUploadProgress(pct));

    if (result.success) {
      setUploadedDataset(result.data);
      setUploadStatus("success");
    } else {
      setUploadError(result.error);
      setUploadStatus("error");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-row">
          <Database size={20} className="page-title-icon" />
          <h1 className="page-title">Dataset Management</h1>
        </div>
        <p className="page-subtitle">
          Upload a .npz hyperspectral cube or inspect the built-in synthetic demo dataset.
        </p>
      </div>

      <div className="two-col-layout">
        {/* Left — Upload Panel */}
        <section className="page-section">
          <div className="section-title"><Upload size={15} /><span>Upload Hyperspectral Cube</span></div>

          <div
            className={`upload-dropzone ${uploadStatus === "loading" ? "uploading" : ""}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files[0];
              if (f) handleFile({ target: { files: [f] } });
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".npz"
              style={{ display: "none" }}
              onChange={handleFile}
            />
            {uploadStatus === "loading" ? (
              <>
                <Loader size={28} className="spin" />
                <span className="dz-title">Uploading & Validating…</span>
                <div className="upload-progress-bar">
                  <div className="upload-progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="dz-sub">{uploadProgress}%</span>
              </>
            ) : uploadStatus === "success" ? (
              <>
                <CheckCircle2 size={28} className="text-green" />
                <span className="dz-title">Upload Successful</span>
                <span className="dz-sub">Click to upload another file</span>
              </>
            ) : (
              <>
                <Upload size={28} className="dz-icon" />
                <span className="dz-title">Drop .npz file here or click to browse</span>
                <span className="dz-sub">
                  Requires a NumPy .npz archive with key <code>cube</code> (H, W, bands)
                  and optional <code>labels</code> (H, W)
                </span>
              </>
            )}
          </div>

          {uploadStatus === "error" && (
            <div className="page-error mt-8">
              <AlertTriangle size={14} />
              <span>{uploadError}</span>
            </div>
          )}

          {uploadedDataset && (
            <div className="mt-16">
              <div className="section-title"><FileText size={14} /><span>Uploaded Dataset</span></div>
              <DatasetCard data={uploadedDataset} />
            </div>
          )}
        </section>

        {/* Right — Demo Dataset */}
        <section className="page-section">
          <div className="section-title">
            <Layers size={15} />
            <span>Synthetic Demo Dataset</span>
            <button
              className="btn-action btn-sm"
              onClick={loadDemo}
              disabled={demoLoading}
            >
              {demoLoading ? <Loader size={12} className="spin" /> : null}
              {demoDataset ? "Refresh" : "Inspect"}
            </button>
          </div>

          {!demoDataset && !demoLoading && (
            <div className="no-data">
              <p>The built-in 32×32×16 synthetic HSI demo dataset is always available.</p>
              <p>Click <strong>Inspect</strong> to load its metadata from the backend.</p>
            </div>
          )}

          {demoLoading && (
            <div className="page-loading">
              <Loader size={18} className="spin" />
              <span>Fetching demo dataset metadata…</span>
            </div>
          )}

          {demoDataset && <DatasetCard data={demoDataset} />}
        </section>
      </div>
    </div>
  );
}
