import { useEffect, useState } from "react";
import "./PredictionVisualization.css";

const API_URL = "http://127.0.0.1:8000/api/predictions";

export default function PredictionVisualization() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Unable to load prediction data");
        }
        return response.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <div className="prediction-panel">
        <h3>Hyperspectral Prediction Map</h3>
        <p className="prediction-error">{error}</p>
      </div>
    );
  }

  if (!data) {
    return <div className="prediction-panel">Loading prediction map...</div>;
  }

  const predictions = data.prediction_map.flat();

  const healthyCount = predictions.filter((value) => value === 0).length;

  const stressCount = predictions.filter((value) => value === 1).length;

  const total = predictions.length;
  const stressPercentage = (stressCount / total) * 100;

  return (
    <section className="prediction-panel">
      <div className="prediction-header">
        <div>
          <h3>Hyperspectral Prediction Map</h3>
          <p>ML-based crop health classification</p>
        </div>

        <span className="prediction-live">Model Output</span>
      </div>

      <div className="prediction-stats">
        <div className="prediction-stat healthy-stat">
          <span>Healthy Pixels</span>
          <strong>{healthyCount}</strong>
        </div>

        <div className="prediction-stat stress-stat">
          <span>Stress Pixels</span>
          <strong>{stressCount}</strong>
        </div>

        <div className="prediction-stat">
          <span>Stress Percentage</span>
          <strong>{stressPercentage.toFixed(1)}%</strong>
        </div>
      </div>

      <div className="prediction-map-wrapper">
        <div
          className="prediction-grid"
          style={{
            gridTemplateColumns: `repeat(${data.width}, 1fr)`,
          }}
        >
          {predictions.map((value, index) => (
            <div
              key={index}
              className={
                value === 1
                  ? "prediction-pixel stress-pixel"
                  : "prediction-pixel healthy-pixel"
              }
              title={`Pixel ${index}: ${value === 1 ? "Stress" : "Healthy"}`}
            />
          ))}
        </div>
      </div>

      <div className="prediction-legend">
        <span>
          <i className="legend-healthy"></i>
          Healthy
        </span>

        <span>
          <i className="legend-stress"></i>
          Stress
        </span>
      </div>

      <p className="prediction-footer">
        Grid resolution: {data.height} × {data.width} pixels
      </p>
    </section>
  );
}
