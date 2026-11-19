import React, { useEffect, useState } from "react";
import "./PredictionDashboard.css";
import Navbar_frame from "../../Components/Navbar_frame";

const STORAGE_KEY = "plantDiseasePredictions";

const Dashboard = () => {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    loadPredictions();
  }, []);

  const loadPredictions = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      setPredictions(saved);
    } catch (error) {
      console.error("Failed to load predictions:", error);
      setPredictions([]);
    }
  };

  const handleDeleteOne = (id) => {
    const updated = predictions.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setPredictions(updated);
  };

  const handleClearAll = () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete all saved prediction data?"
    );

    if (!confirmDelete) return;

    localStorage.removeItem(STORAGE_KEY);
    setPredictions([]);
  };

  return (
    <div className="dashboardPage">
         <div className="navbar_frame">
          <Navbar_frame />
        </div>
        
      <div className="dashboardHeader">

       

        <div>
          <p className="dashboardBadge">Plant Disease Dashboard</p>
          <h1>Saved Prediction Reports</h1>
          <p className="dashboardSubtext">
            View all predicted plant diseases stored in localStorage.
          </p>
        </div>

        <button className="clearAllBtn" onClick={handleClearAll}>
          Delete All Data
        </button>
      </div>

      <div className="statsGrid">
        <div className="statCard">
          <span className="statLabel">Total Predictions</span>
          <strong className="statValue">{predictions.length}</strong>
        </div>

        <div className="statCard">
          <span className="statLabel">Latest Status</span>
          <strong className="statValue">
            {predictions.length ? "Saved" : "No Data"}
          </strong>
        </div>
      </div>

      {predictions.length === 0 ? (
        <div className="emptyState">
          <h2>No saved predictions found</h2>
          <p>
            Make a prediction first, then the saved disease report will appear
            here.
          </p>
        </div>
      ) : (
        <div className="predictionGrid">
          {predictions
            .slice()
            .reverse()
            .map((item) => (
              <div className="predictionCard" key={item.id}>
                <div className="cardTop">
                  <div>
                    <p className="cardCrop">{item.crop}</p>
                    <h3>{item.disease}</h3>
                  </div>

                  <button
                    className="deleteBtn"
                    onClick={() => handleDeleteOne(item.id)}
                  >
                    Delete
                  </button>
                </div>

                <div className="infoGrid">
                  <div className="infoBox">
                    <span className="infoLabel">Detected Disease</span>
                    <span className="infoValue">{item.detectedDisease}</span>
                  </div>

                  <div className="infoBox">
                    <span className="infoLabel">Confidence</span>
                    <span className="infoValue">{item.confidence}</span>
                  </div>

                  <div className="infoBox">
                    <span className="infoLabel">Date</span>
                    <span className="infoValue">
                      {item.timestamp
                        ? new Date(item.timestamp).toLocaleString()
                        : "N/A"}
                    </span>
                  </div>

                  <div className="infoBox">
                    <span className="infoLabel">Contact</span>
                    <span className="infoValue">{item.contact || "N/A"}</span>
                  </div>
                </div>

                {item.cause && (
                  <div className="detailBlock">
                    <h4>Cause</h4>
                    <p>{item.cause}</p>
                  </div>
                )}

                {item.treatment && (
                  <div className="detailBlock">
                    <h4>Treatment</h4>
                    <p>{item.treatment}</p>
                  </div>
                )}

                <div className="detailBlock">
                  <h4>Medicine</h4>
                  <ul>
                    {(item.medicine || []).map((med, index) => (
                      <li key={index}>{med}</li>
                    ))}
                  </ul>
                </div>

                <div className="detailBlock">
                  <h4>Care</h4>
                  <ul>
                    {(item.care || []).map((careItem, index) => (
                      <li key={index}>{careItem}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;