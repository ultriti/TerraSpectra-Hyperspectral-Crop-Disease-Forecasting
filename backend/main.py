import json
from contextlib import asynccontextmanager
from pathlib import Path

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from tensorflow import keras

IMG_SIZE = 256
BASE_DIR = Path(__file__).resolve().parent
OUTPUT_DIR = BASE_DIR.parent / "data" / "output"

MODEL_DIR = next(
    (
        d
        for d in [
            BASE_DIR / "model",
            BASE_DIR / "ml" / "models",
            BASE_DIR.parent / "backend" / "ml" / "models",
            BASE_DIR.parent / "backend" / "model",
        ]
        if (d / "plant_column.json").exists()
    ),
    BASE_DIR / "model",
)

state = {"model": None, "classes": []}


def rec(crop, severity, lead_time, sector, text):
    return {
        "crop": crop,
        "severity": severity,
        "lead_time": lead_time,
        "mapped_sector": sector,
        "recommendation": text,
    }


RECOMMENDATIONS = {
    "Potato___Late_blight": rec(
        "Potato / Solanaceae",
        "CRITICAL",
        "21 Days Pre-Symptomatic",
        "Sector A",
        "Emergency targeted bio-fungicide drone dispersion (Mefenoxam or Mandipropamid). Isolate Zone Alpha-9 to prevent spore dispersal.",
    ),
    "Potato___Early_blight": rec(
        "Potato / Solanaceae",
        "HIGH",
        "14 Days Pre-Symptomatic",
        "Sector A",
        "Apply preventative copper hydroxide spray; increase sensor monitoring on soil moisture and leaf wetness.",
    ),
    "Tomato_Late_blight": rec(
        "Tomato",
        "CRITICAL",
        "18 Days Pre-Symptomatic",
        "Sector A",
        "Targeted bio-fungicide application; cease overhead irrigation immediately.",
    ),
    "Tomato_Early_blight": rec(
        "Tomato",
        "HIGH",
        "14 Days Pre-Symptomatic",
        "Sector A",
        "Prune infected lower foliage; apply chlorothalonil preventative barrier.",
    ),
    "Tomato_Bacterial_spot": rec(
        "Tomato",
        "HIGH",
        "10 Days Pre-Symptomatic",
        "Sector B",
        "Copper-bactericide combined with mancozeb application. Disinfect farm machinery.",
    ),
    "Pepper__bell___Bacterial_spot": rec(
        "Bell Pepper",
        "HIGH",
        "12 Days Pre-Symptomatic",
        "Sector C",
        "Apply streptomycin sulfate or copper bactericide; adjust canopy airflow.",
    ),
    "healthy": rec(
        "Multiple Varieties",
        "NONE",
        "N/A",
        "Sectors A-D",
        "Crop chlorophyll reflection is optimal. Continue routine precision drip irrigation schedule.",
    ),
}
DEFAULT_REC = rec(
    "Detected Field Crop",
    "MODERATE",
    "14 Days Pre-Symptomatic",
    "Sector A",
    "Conduct localized leaf sampling and verify NIR spectral reflectance at 705nm.",
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        state["classes"] = json.loads((MODEL_DIR / "plant_column.json").read_text())[
            "column"
        ]
        state["model"] = keras.models.load_model(
            MODEL_DIR / "plant_status_detector_v3.1.keras"
        )
        print("Artifacts loaded from", MODEL_DIR)
    except Exception as e:
        print(f"Artifact loading failed: {e}")
    yield


app = FastAPI(
    title="TerraSpectra Plant Health Detection API", version="1.2.0", lifespan=lifespan
)

# NOTE: allow_origins=["*"] cannot be combined with allow_credentials=True (browsers reject it).
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# @app.get("/")
# def home():
#     return {
#         "service": "TerraSpectra Plant Health Detection API",
#         "status": "online",
#         "version": app.version,
#         "model_loaded": state["model"] is not None,
#         "classes_count": len(state["classes"]),
#     }


# @app.get("/api/diseases")
# def get_diseases():
#     return {
#         "columns": state["classes"],
#         "total_classes": len(state["classes"]),
#         "recommendations": RECOMMENDATIONS,
#     }


# @app.get("/api/farm_overview")
# def get_farm_overview():
#     def sector(i, crop, acres, status, idx, threat=None):
#         return {
#             "id": f"sector-{i.lower()}",
#             "sector": f"Sector {i}",
#             "crop": crop,
#             "acreage": acres,
#             "health_status": status,
#             "chlorophyll_index": idx,
#             "active_threat": threat,
#         }

#     return {
#         "farm_id": "terra-farm-main",
#         "name": "TerraSpectra Alpha Experimental Farm",
#         "location": "Salinas Valley, CA",
#         "coordinates": {"longitude": -121.61, "latitude": 36.66},
#         "total_acreage": 1000,
#         "sectors": [
#             sector(
#                 "A",
#                 "Romaine Lettuce & Solanaceae",
#                 295,
#                 "WARNING",
#                 0.62,
#                 "Fungal Blight Outbreak (Downy Mildew / Late Blight)",
#             ),
#             sector("B", "Strawberries & Berries", 285, "OPTIMAL", 0.89),
#             sector("C", "Broccoli & Brassicas", 240, "OPTIMAL", 0.84),
#             sector("D", "Celery & Root Crops", 180, "NORMAL", 0.79),
#         ],
#         "active_alert": {
#             "target_zone": "Sector A (Zone Alpha-9)",
#             "affected_acreage": 5.12,
#             "threat": "Late Blight / Fungal Blight Outbreak",
#             "lead_time": "21 Days Pre-Symptomatic",
#             "confidence": "94.8%",
#         },
#     }


# # Plain `def` so FastAPI runs the blocking model.predict in a threadpool.
# @app.post("/predict_plant_health")
# def predict_plant_health(image: UploadFile = File(...)):
#     if state["model"] is None or not state["classes"]:
#         raise HTTPException(
#             503,
#             "Model artifacts are not loaded. Ensure plant_status_detector_v3.1.keras exists.",
#         )
#     if not (image.content_type or "").startswith("image/"):
#         raise HTTPException(400, "Please upload a valid image (JPEG/PNG/TIFF)")

#     data = image.file.read()
#     img = (
#         cv2.imdecode(np.frombuffer(data, np.uint8), cv2.IMREAD_COLOR) if data else None
#     )
#     if img is None:
#         raise HTTPException(400, "Empty or undecodable image")

#     x = cv2.resize(cv2.cvtColor(img, cv2.COLOR_BGR2RGB), (IMG_SIZE, IMG_SIZE)).astype(
#         "float32"
#     )
#     try:
#         probs = state["model"].predict(x[None], verbose=0)[0]
#     except Exception as e:
#         raise HTTPException(500, f"Prediction failed: {e}")

#     idx = int(np.argmax(probs))
#     confidence = round(float(probs[idx]) * 100, 2)
#     name = state["classes"][idx] if idx < len(state["classes"]) else "Unknown"
#     pretty = name.replace("___", " - ").replace("__", " ").replace("_", " ")
#     healthy = "healthy" in name.lower()
#     info = RECOMMENDATIONS.get(name) or (
#         RECOMMENDATIONS["healthy"] if healthy else DEFAULT_REC
#     )

#     return {
#         "message": f"Prediction: {idx}, Plant disease: {pretty}, Confidence: {confidence}%",
#         "desease_name": name,  # (sic) kept so the existing frontend doesn't break
#         "display_name": pretty,
#         "confidence": confidence,
#         "prediction": idx,
#         "is_healthy": healthy,
#         "severity": info["severity"],
#         "lead_time": info["lead_time"],
#         "mapped_sector": info["mapped_sector"],
#         "recommendation": info["recommendation"],
#         "input_resolution": f"{img.shape[1]}x{img.shape[0]}",
#     }




# Optional HSI pipeline routes
try:
    from app.api.v1.router import api_router

    app.include_router(api_router, prefix="/api")
except Exception as e:
    print(f"[TerraSpectra] HSI router not loaded: {e}")
