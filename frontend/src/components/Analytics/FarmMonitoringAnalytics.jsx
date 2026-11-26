
import { useEffect, useState } from "react";
import "./FarmMonitoringAnalytics.css";

const API_URL = "http://127.0.0.1:8000";

function StatCard({ title, value, unit, description, color }) {
  return (
    <div className="analytics-card">
      <div className="analytics-card-top">
        <span>{title}</span>
        <span
          className="analytics-dot"
          style={{ backgroundColor: color }}
        />
      </div>

      <div className="analytics-value">
        {value}
        <small>{unit}</small>
      </div>

      <p>{description}</p>
    </div>
  );
}

export default function FarmMonitoringAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch(`${API_URL}/api/analytics`);

        if (!response.ok) {
          throw new Error("Unable to retrieve farm analytics.");
        }

        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) return <p>Loading farm analytics...</p>;

  if (error) {
    return <p className="analytics-error">{error}</p>;
  }

  if (!analytics) return null;

  return (
    <section className="farm-analytics">
      <div className="analytics-heading">
        <div>
          <h2>Farm Monitoring Analytics</h2>
          <p>Prediction summary for {analytics.farm_name}</p>
        </div>
        <span className="analytics-status">Analysis Available</span>
      </div>

      <div className="analytics-grid">
        <StatCard
          title="Total Farm Area"
          value={analytics.total_area_acres}
          unit="acres"
          description={`${analytics.total_pixels} analyzed pixels`}
          color="#3b82f6"
        />

        <StatCard
          title="Healthy Area"
          value={analytics.healthy_area_acres}
          unit="acres"
          description={`${analytics.healthy_percentage}% of farm`}
          color="#22c55e"
        />

        <StatCard
          title="Affected Area"
          value={analytics.affected_area_acres}
          unit="acres"
          description={`${analytics.stress_percentage}% of farm`}
          color="#ef4444"
        />

        <StatCard
          title="Stress Percentage"
          value={analytics.stress_percentage}
          unit="%"
          description={`${analytics.stress_pixels} stress-classified pixels`}
          color="#f97316"
        />
      </div>

      <div className="analytics-summary">
        <h3>Prediction Summary</h3>

        <div className="summary-bar">
          <div
            className="healthy-bar"
            style={{ width: `${analytics.healthy_percentage}%` }}
          />
          <div
            className="stress-bar"
            style={{ width: `${analytics.stress_percentage}%` }}
          />
        </div>

        <div className="summary-legend">
          <span>
            <i className="healthy-dot" />
            Healthy: {analytics.healthy_percentage}%
          </span>

          <span>
            <i className="stress-dot" />
            Stress: {analytics.stress_percentage}%
          </span>
        </div>

        <div className="summary-details">
          <p>
            <strong>Healthy pixels:</strong>{" "}
            {analytics.healthy_pixels}
          </p>
          <p>
            <strong>Stress pixels:</strong>{" "}
            {analytics.stress_pixels}
          </p>
          <p>
            <strong>Average stress score:</strong>{" "}
            {(analytics.average_stress_score * 100).toFixed(2)}%
          </p>
          <p>
            <strong>Map resolution:</strong>{" "}
            {analytics.map_width} × {analytics.map_height}
          </p>
        </div>
      </div>
    </section>
  );
}
