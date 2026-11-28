"""
TerraSpectra – FastAPI Application Entry Point
Robust startup: does NOT crash if TensorFlow / OpenCV is not installed.
"""

import json
from contextlib import asynccontextmanager
from pathlib import Path

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

# ── Optional heavy dependencies ───────────────────────────────────────────────
try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False

try:
    from tensorflow import keras
    KERAS_AVAILABLE = True
except Exception:
    KERAS_AVAILABLE = False

# ── Config ────────────────────────────────────────────────────────────────────
IMG_SIZE = 256
BASE_DIR  = Path(__file__).resolve().parent
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
        if d.exists() and (d / "plant_column.json").exists()
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
    "Potato___Late_blight":    rec("Potato / Solanaceae", "CRITICAL", "21 Days Pre-Symptomatic", "Sector A",
                                   "Emergency targeted bio-fungicide drone dispersion (Mefenoxam or Mandipropamid). Isolate Zone Alpha-9."),
    "Potato___Early_blight":   rec("Potato / Solanaceae", "HIGH",     "14 Days Pre-Symptomatic", "Sector A",
                                   "Apply preventative copper hydroxide spray; increase sensor monitoring."),
    "Tomato_Late_blight":      rec("Tomato",             "CRITICAL", "18 Days Pre-Symptomatic", "Sector A",
                                   "Targeted bio-fungicide application; cease overhead irrigation immediately."),
    "Tomato_Early_blight":     rec("Tomato",             "HIGH",     "14 Days Pre-Symptomatic", "Sector A",
                                   "Prune infected lower foliage; apply chlorothalonil preventative barrier."),
    "Tomato_Bacterial_spot":   rec("Tomato",             "HIGH",     "10 Days Pre-Symptomatic", "Sector B",
                                   "Copper-bactericide combined with mancozeb application."),
    "Pepper__bell___Bacterial_spot": rec("Bell Pepper",  "HIGH",     "12 Days Pre-Symptomatic", "Sector C",
                                   "Apply streptomycin sulfate or copper bactericide; adjust canopy airflow."),
    "healthy": rec("Multiple Varieties", "NONE", "N/A", "Sectors A-D",
                   "Crop chlorophyll reflection is optimal. Continue routine precision drip irrigation."),
}
DEFAULT_REC = rec("Detected Field Crop", "MODERATE", "14 Days Pre-Symptomatic", "Sector A",
                  "Conduct localized leaf sampling and verify NIR spectral reflectance at 705 nm.")


@asynccontextmanager
async def lifespan(_: FastAPI):
    if KERAS_AVAILABLE:
        try:
            plant_col_path = MODEL_DIR / "plant_column.json"
            model_path     = MODEL_DIR / "plant_status_detector_v3.1.keras"
            if plant_col_path.exists() and model_path.exists():
                state["classes"] = json.loads(plant_col_path.read_text())["column"]
                state["model"]   = keras.models.load_model(model_path)
                print(f"[TerraSpectra] Keras model loaded from {MODEL_DIR}")
            else:
                print(f"[TerraSpectra] Keras model files not found in {MODEL_DIR} – skipping.")
        except Exception as exc:
            print(f"[TerraSpectra] Keras model load failed: {exc}")
    else:
        print("[TerraSpectra] TensorFlow not installed – Keras model skipped.")
    yield


app = FastAPI(
    title="TerraSpectra Hyperspectral Crop-Health API",
    version="1.3.0",
    lifespan=lifespan,
)

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

# ── HSI Pipeline routes ───────────────────────────────────────────────────────
try:
    from app.api.v1.router import api_router
    app.include_router(api_router, prefix="/api")
    print("[TerraSpectra] HSI pipeline routes loaded ✔")
except Exception as exc:
    print(f"[TerraSpectra] HSI router not loaded: {exc}")

# ── Root health check ─────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {
        "service":      "TerraSpectra Hyperspectral Crop-Health API",
        "version":      app.version,
        "status":       "online",
        "keras_loaded": state["model"] is not None,
        "docs":         "/docs",
    }
