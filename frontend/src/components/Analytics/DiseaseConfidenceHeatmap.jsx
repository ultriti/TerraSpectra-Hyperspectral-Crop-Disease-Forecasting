
import { useEffect, useState } from "react";
import "./DiseaseConfidenceHeatmap.css";

const API_URL = "http://127.0.0.1:8000/api/confidence";

function getConfidenceColor(value) {
  const stops = [
    { value: 0.0, color: [22, 163, 74] },
    { value: 0.25, color: [163, 230, 53] },
    { value: 0.5, color: [250, 204, 21] },
    { value: 0.75, color: [249, 115, 22] },
    { value: 1.0, color: [220, 38, 38] },
  ];

  const v = Math.max(0, Math.min(1, value));

  const upperIndex = stops.findIndex(
    (stop) => stop.value >= v
  );

  if (upperIndex <= 0) {
    return `rgb(${stops[0].color.join(",")})`;
  }

  const lower = stops[upperIndex - 1];
  const upper = stops[upperIndex];

  const t =
    (v - lower.value) /
    (upper.value - lower.value);

  const rgb = lower.color.map((channel, i) =>
    Math.round(
      channel + t * (upper.color[i] - channel)
    )
  );

  return `rgb(${rgb.join(",")})`;
}

export default function DiseaseConfidenceHeatmap() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [displayMode, setDisplayMode] = useState("probability");

  useEffect(() => {
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Could not load confidence data");
        }

        return response.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) {
    return (
      <section className="confidence-panel">
        <h3>Disease Confidence Heatmap</h3>
        <p className="confidence-error">{error}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="confidence-panel">
        Loading confidence heatmap...
      </section>
    );
  }

  const values = data.confidence_map.flat();

  const average = data.mean;
  const maximum = data.max;
  const minimum = data.min;

  return (
    <section className="confidence-panel">

      <div className="confidence-header">
        <div>
          <h3>Disease Confidence Heatmap</h3>
          <p>Pixel-level predicted stress probability</p>
        </div>

        <span className="confidence-badge">
          3D-CNN Output
        </span>
      </div>

      <div className="confidence-controls">
        <button
          className={displayMode === "probability" ? "active" : ""}
          onClick={() => setDisplayMode("probability")}
        >
          Probability
        </button>

        <button
          className={displayMode === "percentage" ? "active" : ""}
          onClick={() => setDisplayMode("percentage")}
        >
          Percentage
        </button>
      </div>

      <div className="confidence-stats">

        <div>
          <span>Average</span>
          <strong>{(average * 100).toFixed(1)}%</strong>
        </div>

        <div>
          <span>Maximum</span>
          <strong>{(maximum * 100).toFixed(1)}%</strong>
        </div>

        <div>
          <span>Minimum</span>
          <strong>{(minimum * 100).toFixed(1)}%</strong>
        </div>

      </div>

      <div className="confidence-grid-wrapper">

        <div
          className="confidence-grid"
          style={{
            gridTemplateColumns: `repeat(${data.width}, 1fr)`
          }}
        >
          {values.map((value, index) => (
            <div
              key={index}
              className="confidence-pixel"
              style={{
                backgroundColor: getConfidenceColor(value)
              }}
              title={`Pixel ${index}: ${
                displayMode === "percentage"
                  ? (value * 100).toFixed(1) + "%"
                  : value.toFixed(3)
              }`}
            />
          ))}
        </div>

      </div>

      <div className="confidence-gradient"></div>

      <div className="confidence-legend">
        <span>Low probability</span>
        <span>High probability</span>
      </div>

      <p className="confidence-footer">
        Resolution: {data.height} × {data.width} pixels
      </p>

    </section>
  );
}
