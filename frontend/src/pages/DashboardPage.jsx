/**
 * DashboardPage.jsx
 * Shows HSI pipeline overview: dataset stats, model availability, latest prediction.
 * All data is fetched from the FastAPI backend — no hardcoded metrics.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Activity, Database, Cpu, TrendingUp, AlertTriangle,
  CheckCircle2, RefreshCw, ArrowRight, Layers
} from "lucide-react";
import { fetchDashboard } from "../services/api";

function StatCard({ label, value, sub, color = "#00f0ff", icon: Icon }) {
  return (
    <div className="dash-stat-card">
      <div className="dsc-header">
        {Icon && <Icon size={15} style={{ color }} />}
        <span className="dsc-label">{label}</span>
      </div>
      <div className="dsc-value" style={{ color }}>{value}</div>
      {sub && <div className="dsc-sub">{sub}</div>}
    </div>
  );
}

function ModelBadge({ model }) {
  const isReady = model.status === "ready";
  return (
    <div className={`model-badge ${isReady ? "ready" : "demo"}`}>
      <Cpu size={13} />
      <div className="mb-info">
        <span className="mb-name">{model.name}</span>
        <span className="mb-status">{model.status.toUpperCase()}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const result = await fetchDashboard();
    if (result.success) {
      setData(result.data);
      setLastRefresh(new Date().toLocaleTimeString());
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const ds  = data?.dataset;
  const pred = data?.prediction;
  const models = data?.available_models || [];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-row">
          <Activity size={20} className="page-title-icon" />
          <h1 className="page-title">Mission Dashboard</h1>
          {lastRefresh && <span className="page-refresh-ts">Updated {lastRefresh}</span>}
        </div>
        <p className="page-subtitle">
          Real-time hyperspectral pipeline status — Synthetic Demo Dataset (32×32×16 HSI cube)
        </p>
        {data?.demo_notice && (
          <div className="demo-notice">
            <AlertTriangle size={13} />
            <span>{data.demo_notice}</span>
          </div>
        )}
        <div className="page-actions">
          <button className="btn-action" onClick={load} disabled={loading}>
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            {loading ? "Loading…" : "Refresh"}
          </button>
          <Link to="/predict" className="btn-action btn-primary">
            <TrendingUp size={14} />
            Run New Prediction
          </Link>
        </div>
      </div>

      {error && (
        <div className="page-error">
          <AlertTriangle size={15} />
          <span>Backend unavailable: {error}</span>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Dataset Overview */}
          <section className="page-section">
            <div className="section-title">
              <Database size={15} />
              <span>Dataset Overview</span>
              <Link to="/dataset" className="section-link">Manage <ArrowRight size={12} /></Link>
            </div>
            {ds ? (
              <div className="stat-grid">
                <StatCard
                  label="TOTAL PIXELS"
                  value={ds.total_pixels?.toLocaleString() ?? "—"}
                  sub={`${ds.shape?.[0]}×${ds.shape?.[1]} spatial resolution`}
                  icon={Layers}
                />
                <StatCard
                  label="SPECTRAL BANDS"
                  value={ds.bands ?? "—"}
                  sub="Hyperspectral channels"
                  color="#00ff88"
                  icon={Activity}
                />
                <StatCard
                  label="HEALTHY PIXELS"
                  value={ds.label_distribution?.healthy?.toLocaleString() ?? "—"}
                  sub="Ground-truth class 0"
                  color="#00ff88"
                  icon={CheckCircle2}
                />
                <StatCard
                  label="STRESSED PIXELS"
                  value={ds.label_distribution?.stressed?.toLocaleString() ?? "—"}
                  sub="Ground-truth class 1"
                  color="#ff2a55"
                  icon={AlertTriangle}
                />
              </div>
            ) : (
              <div className="no-data">No dataset loaded. <Link to="/dataset">Upload one →</Link></div>
            )}
          </section>

          {/* Latest Prediction */}
          <section className="page-section">
            <div className="section-title">
              <TrendingUp size={15} />
              <span>Latest Prediction</span>
              <Link to="/visualization" className="section-link">View Map <ArrowRight size={12} /></Link>
            </div>
            {pred ? (
              <div className="stat-grid">
                <StatCard
                  label="TOTAL ANALYZED"
                  value={pred.total_pixels?.toLocaleString() ?? "—"}
                  sub="Pixels processed"
                  icon={Activity}
                />
                <StatCard
                  label="HEALTHY"
                  value={pred.healthy_count?.toLocaleString() ?? "—"}
                  sub="Predicted class 0"
                  color="#00ff88"
                  icon={CheckCircle2}
                />
                <StatCard
                  label="STRESSED"
                  value={pred.stressed_count?.toLocaleString() ?? "—"}
                  sub="Predicted class 1"
                  color="#ff2a55"
                  icon={AlertTriangle}
                />
                <StatCard
                  label="STRESS RATE"
                  value={`${pred.stress_percentage ?? "—"}%`}
                  sub={`Avg confidence: ${((pred.mean_confidence ?? 0) * 100).toFixed(1)}%`}
                  color="#f59e0b"
                  icon={TrendingUp}
                />
              </div>
            ) : (
              <div className="no-data">
                No prediction yet. <Link to="/predict">Run prediction →</Link>
              </div>
            )}
          </section>

          {/* Available Models */}
          <section className="page-section">
            <div className="section-title">
              <Cpu size={15} />
              <span>Available Models</span>
              <Link to="/models" className="section-link">Evaluate <ArrowRight size={12} /></Link>
            </div>
            <div className="models-row">
              {models.map((m) => <ModelBadge key={m.id} model={m} />)}
            </div>
          </section>
        </>
      )}

      {loading && (
        <div className="page-loading">
          <RefreshCw size={22} className="spin" />
          <span>Loading dashboard data from backend…</span>
        </div>
      )}
    </div>
  );
}
