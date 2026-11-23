/**
 * ModelsPage.jsx — Model Selection & Evaluation Metrics
 * Shows available trained models and their performance metrics from the backend.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Cpu, TrendingUp, RefreshCw, AlertTriangle,
  CheckCircle2, ArrowRight, BarChart2
} from "lucide-react";
import { fetchModels, fetchModelMetrics } from "../services/api";

function MetricBox({ label, value, color = "#00f0ff" }) {
  return (
    <div className="metric-pill">
      <span className="mp-label">{label}</span>
      <span className="mp-value" style={{ color }}>{value}</span>
    </div>
  );
}

function ConfusionMatrix({ matrix, labels }) {
  if (!matrix) return null;
  return (
    <div className="confusion-matrix">
      <div className="cm-title">Confusion Matrix</div>
      <div className="cm-grid" style={{ gridTemplateColumns: `auto repeat(${matrix[0]?.length ?? 2}, 1fr)` }}>
        {/* header row */}
        <div className="cm-cell cm-corner">Actual \ Predicted</div>
        {labels.map((l, i) => <div key={i} className="cm-cell cm-head">{l}</div>)}
        {/* data rows */}
        {matrix.map((row, r) => (
          <>
            <div key={`lbl-${r}`} className="cm-cell cm-head">{labels[r]}</div>
            {row.map((val, c) => (
              <div
                key={`${r}-${c}`}
                className={`cm-cell cm-data ${r === c ? "cm-diag" : ""}`}
              >
                {val}
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  );
}

export default function ModelsPage() {
  const [models, setModels] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const [modelsRes, metricsRes] = await Promise.all([
      fetchModels(),
      fetchModelMetrics()
    ]);
    if (modelsRes.success) setModels(modelsRes.data?.models ?? []);
    if (metricsRes.success) setMetrics(metricsRes.data);
    if (!modelsRes.success && !metricsRes.success) setError(modelsRes.error || metricsRes.error);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const rfMetrics = metrics?.rf;
  const cnnMetrics = metrics?.cnn;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-row">
          <Cpu size={20} className="page-title-icon" />
          <h1 className="page-title">Model Evaluation</h1>
        </div>
        <p className="page-subtitle">
          Available trained models and their performance metrics on the synthetic demo dataset.
        </p>
        <div className="page-actions">
          <button className="btn-action" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            {loading ? "Loading…" : "Refresh"}
          </button>
          <Link to="/predict" className="btn-action btn-primary">
            <TrendingUp size={14} />
            Run Prediction
          </Link>
        </div>
      </div>

      {error && (
        <div className="page-error">
          <AlertTriangle size={15} />
          <span>Backend unavailable: {error}</span>
        </div>
      )}

      {loading && (
        <div className="page-loading">
          <RefreshCw size={22} className="spin" />
          <span>Loading model data from backend…</span>
        </div>
      )}

      {!loading && (
        <>
          {/* Model Cards */}
          <section className="page-section">
            <div className="section-title"><Cpu size={15} /><span>Available Models</span></div>
            <div className="models-grid">
              {models.map((m) => (
                <div key={m.id} className={`model-card ${m.status}`}>
                  <div className="mc-header">
                    <Cpu size={16} />
                    <span className="mc-name">{m.name}</span>
                    <span className={`status-badge ${m.status === "ready" ? "ready" : "demo"}`}>
                      {m.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="mc-type">{m.type}</div>
                  <p className="mc-desc">{m.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Random Forest Metrics */}
          {rfMetrics && (
            <section className="page-section">
              <div className="section-title">
                <BarChart2 size={15} />
                <span>Random Forest — Evaluation on Demo Dataset</span>
                {rfMetrics.status === "evaluated" ? (
                  <CheckCircle2 size={14} className="text-green" />
                ) : (
                  <AlertTriangle size={14} className="text-warning" />
                )}
              </div>

              {rfMetrics.status === "evaluated" ? (
                <>
                  <p className="metrics-dataset-note">
                    Dataset: <strong>{rfMetrics.dataset}</strong>
                  </p>
                  <div className="metrics-grid">
                    <MetricBox label="ACCURACY"  value={`${(rfMetrics.metrics?.accuracy * 100).toFixed(2)}%`} color="#00f0ff" />
                    <MetricBox label="PRECISION" value={`${(rfMetrics.metrics?.precision * 100).toFixed(2)}%`} color="#00ff88" />
                    <MetricBox label="RECALL"    value={`${(rfMetrics.metrics?.recall * 100).toFixed(2)}%`}    color="#00ff88" />
                    <MetricBox label="F1-SCORE"  value={`${(rfMetrics.metrics?.f1_score * 100).toFixed(2)}%`} color="#f59e0b" />
                  </div>
                  <ConfusionMatrix
                    matrix={rfMetrics.confusion_matrix?.matrix}
                    labels={rfMetrics.confusion_matrix?.labels ?? ["Healthy (0)", "Stress (1)"]}
                  />
                </>
              ) : (
                <div className="page-error">
                  <AlertTriangle size={14} />
                  <span>{rfMetrics.error ?? "Metrics unavailable"}</span>
                </div>
              )}
            </section>
          )}

          {/* CNN Metrics (demo/unavailable) */}
          {cnnMetrics && (
            <section className="page-section">
              <div className="section-title">
                <BarChart2 size={15} />
                <span>PyTorch 3D-CNN — Metrics</span>
                <span className={`status-badge demo`}>DEMO</span>
              </div>
              <div className="cnn-demo-note">
                <AlertTriangle size={14} className="text-warning" />
                <span>{cnnMetrics.note}</span>
              </div>
              {cnnMetrics.metrics && (
                <div className="metrics-grid">
                  <MetricBox label="ACCURACY"  value={`${(cnnMetrics.metrics.accuracy * 100).toFixed(2)}%`} />
                  <MetricBox label="PRECISION" value={`${(cnnMetrics.metrics.precision * 100).toFixed(2)}%`} />
                  <MetricBox label="RECALL"    value={`${(cnnMetrics.metrics.recall * 100).toFixed(2)}%`} />
                  <MetricBox label="F1-SCORE"  value={`${(cnnMetrics.metrics.f1_score * 100).toFixed(2)}%`} />
                </div>
              )}
            </section>
          )}

          {/* CTA */}
          <div className="page-cta-row">
            <Link to="/predict" className="btn-action btn-primary">
              Run Prediction with Selected Model <ArrowRight size={14} />
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
