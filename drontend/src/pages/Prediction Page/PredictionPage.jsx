import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./PredictionPage.css";
import Navbar_frame from "../../Components/Navbar_frame";

const DISEASE_ADVICE = {
  Pepper__bell___Bacterial_spot: {
    crop: "Pepper",
    disease: "Bacterial Spot",
    contact: "Kisan Call Center: 1800-180-1551",
    medicine: [
      "Use a copper-based spray only as per label and local recommendation",
      "Use only approved agrochemical products",
    ],
    care: [
      "Remove infected leaves and badly affected plants",
      "Avoid overhead irrigation",
      "Improve airflow around plants",
      "Use disease-free seed/transplants",
    ],
  },
  Potato___Early_blight: {
    crop: "Potato",
    disease: "Early Blight",
    contact: "Kisan Call Center: 1800-180-1551",
    medicine: [
      "Use a preventive fungicide only as per label and local recommendation",
    ],
    care: ["Rotate crops", "Remove infected leaves", "Keep foliage dry"],
  },
  Tomato_Septoria_leaf_spot: {
    crop: "Tomato",
    disease: "Septoria Leaf Spot",
    contact: "Kisan Call Center: 1800-180-1551",
    medicine: [
      "Use a preventive fungicide only as per label and local recommendation",
    ],
    care: ["Mulch soil", "Prune affected leaves", "Avoid wetting leaves"],
  },
  Tomato_healthy: {
    crop: "Tomato",
    disease: "Healthy",
    contact: "No treatment needed",
    medicine: ["Continue routine care"],
    care: ["Monitor plant health regularly"],
  },
  Tomato__Tomato_mosaic_virus: {
    crop: "Tomato",
    disease: "Tomato mosaic virus infection",
    cause:
      "Spread by infected seeds, contaminated hands, tools, plant sap, and sometimes nearby infected plants or weeds",
    treatment:
      "No chemical cure available; remove and destroy infected plants if symptoms are severe",
    medicine: [
      "No antiviral medicine for plants",
      "Disinfect tools and wash hands after handling plants",
      "Use virus-free seeds or resistant varieties",
    ],
    care: [
      "Inspect plants regularly for mosaic patterns, leaf curling, stunting, and distorted fruit",
      "Remove infected leaves or whole plants early to reduce spread",
      "Keep weeds controlled around the crop",
      "Avoid touching healthy plants after handling infected ones",
      "Clean pruning tools and stakes with disinfectant",
      "Use resistant tomato varieties when available",
    ],
  },

  Tomato_Leaf_Mold: {
    crop: "Tomato",
    disease: "Leaf mold",
    cause:
      "Fungal infection caused by Passalora fulva; spread in humid, poorly ventilated conditions, especially in greenhouses",
    treatment:
      "No complete cure for infected leaves; remove infected leaves early and use preventive fungicides when needed",
    medicine: [
      "Copper-based fungicides for suppression",
      "Chlorothalonil or azoxystrobin/difenoconazole products where allowed",
      "Organic protectants such as approved copper sprays",
    ],
    care: [
      "Improve air circulation and reduce humidity",
      "Avoid wetting leaves during watering",
      "Remove infected leaves and plant debris",
      "Keep greenhouse or growing area well ventilated",
      "Use resistant tomato varieties when available",
      "Rotate crops and disinfect tools and structures",
    ],
  },
};

const DEFAULT_ADVICE = {
  crop: "Unknown",
  disease: "Unknown Disease",
  contact: "Kisan Call Center: 1800-180-1551",
  medicine: ["Consult local agriculture expert"],
  care: ["Do not use chemicals without diagnosis"],
};

const PredictionPage = () => {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [data, setData] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [dataResValue, setdataResValue] = useState(null);

  const handleFile = (file) => {
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setData(null);
  };

  const savePredictionToLocalStorage = (predictionData, adviceData) => {
    const key = "plantDiseasePredictions";

    const existing = JSON.parse(localStorage.getItem(key)) || [];

    const newEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      crop: adviceData?.crop || "Unknown",
      disease:
        adviceData?.disease ||
        predictionData?.desease_name ||
        "Unknown Disease",
      detectedDisease: predictionData?.desease_name || "Unknown",
      confidence: predictionData?.confidence || "N/A",
      contact: adviceData?.contact || "Kisan Call Center: 1800-180-1551",
      medicine: adviceData?.medicine || [],
      care: adviceData?.care || [],
      cause: adviceData?.cause || "",
      treatment: adviceData?.treatment || "",
    };

    existing.push(newEntry);
    localStorage.setItem(key, JSON.stringify(existing));
  };

  const predictPlant = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Please select an image");

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      setLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:4000/predict_plant_health",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        },
      );

      const matchedAdvice =
        DISEASE_ADVICE[response.data?.desease_name?.trim()] || DEFAULT_ADVICE;

      setData(response.data);
      setResult(response.data.message);
      setdataResValue(response.data);

      savePredictionToLocalStorage(response.data, matchedAdvice);
      
    } catch (error) {
      console.error(error);
      alert("Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  console.log("result::", result);

  // const advice = result && DISEASE_ADVICE[dataResValue?.desease_name] ? DISEASE_ADVICE[result] : DEFAULT_ADVICE;

  console.log("DISEASE_ADVICE]\n", data?.desease_name);
  console.log(
    "DISEASE_ADVICE -------------------------> ><<><><><><><><><><<>>>>>>>>>>>>>>>>>>>\n",
    DISEASE_ADVICE["Tomato_Septoria_leaf_spot"],
  );
  console.log(
    "DISEASE_ADVICE[data?.desease_name?.trim()]\n",
    DISEASE_ADVICE[String(data?.desease_name)],
  );

  const advice = DISEASE_ADVICE[data?.desease_name?.trim()] || DEFAULT_ADVICE;

  return (
    <div className="MainFrame">
      <div className="PredictionContFrame">
        <div className="navbar_frame">
          <Navbar_frame />
        </div>

        <div className="FrameCont">
          <p className="page_title">AI Powered Plant Disease Detection</p>

          <div
            className={`ImagePreview_Frame ${dragActive ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {preview ? (
              <img src={preview} alt="Preview" className="previewImg" />
            ) : (
              <p className="DND_frame">Drag and drop image here</p>
            )}
          </div>

          <form onSubmit={predictPlant}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
            />
            <button type="submit" disabled={loading}>
              {loading ? "Predicting..." : "Predict"}
            </button>
          </form>

          {result && (
            <section
              className="resultCard"
              aria-labelledby="prediction-result-title"
              aria-live="polite"
            >
              <div className="resultHeader">
                <div>
                  <p className="resultBadge">Plant Health Report</p>
                  <h3 id="prediction-result-title">Disease Detection Result</h3>
                </div>

                <div
                  className="confidencePill"
                  aria-label={`Confidence ${data?.confidence}`}
                >
                  {data?.confidence || "N/A"}
                </div>
              </div>

              <div className="resultMeta">
                <p>
                  <span className="metaLabel">Detected disease</span>
                  <span className="metaValue">{data?.desease_name}</span>
                </p>
                <p>
                  <span className="metaLabel">Recommendation status</span>
                  <span className="metaValue">Action advised</span>
                </p>
              </div>

              <div className="adviceGrid">
                <article
                  className="adviceBox"
                  aria-labelledby="treatment-title"
                >
                  <h4 id="treatment-title">Suggested Treatment</h4>
                  {console.log("advice:\n", advice)}
                  <ul>
                    {advice?.medicine?.map((item, i) => (
                      <li key={`medicine-${i}`}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article className="adviceBox" aria-labelledby="care-title">
                  <h4 id="care-title">Plant Care</h4>
                  <ul>
                    {advice?.care?.map((item, i) => (
                      <li key={`care-${i}`}>{item}</li>
                    ))}
                  </ul>
                </article>
              </div>

              <div className="helpCard" aria-labelledby="help-title">
                <h4 id="help-title">Get Expert Help</h4>
                <p className="helplineText">{advice?.contact}</p>

                <div className="contactActions">
                  <a
                    href="tel:18001801551"
                    className="actionLink primaryAction"
                    aria-label="Call agriculture helpline at 1800 180 1551"
                  >
                    Call Helpline
                  </a>

                  <a
                    href="https://example-agri-care.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="actionLink secondaryAction"
                    aria-label="Open agriculture care center website in a new tab"
                  >
                    Care Center Website
                    <span className="sr-only"> Opens in new tab</span>
                  </a>

                  <a
                    href="https://example-pest-control.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="actionLink secondaryAction"
                    aria-label="Open pest control guidance website in a new tab"
                  >
                    Pest Control Guide
                    <span className="sr-only"> Opens in new tab</span>
                  </a>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictionPage;
