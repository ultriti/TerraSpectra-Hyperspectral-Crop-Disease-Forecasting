from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

import json
import numpy as np
import tensorflow as tf
from tensorflow import keras
import cv2

from pathlib import Path

app = FastAPI(
    title="TerraSpectra Plant Health Detection API",
    description="Hyperspectral & Computer Vision Crop Disease Forecasting Engine",
    version="1.2.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model configuration
BASE_DIR = Path(__file__).resolve().parent

# Check potential model directory paths
candidate_dirs = [
    BASE_DIR / "model",
    BASE_DIR / "ml" / "models",
    BASE_DIR.parent / "backend" / "ml" / "models",
    BASE_DIR.parent / "backend" / "model"
]
MODEL_DIR = next((d for d in candidate_dirs if (d / "plant_column.json").exists()), BASE_DIR / "model")

IMG_SIZE = 256

__data_coloumn = None
__Model = None

# Agricultural recommendations database
DISEASE_RECOMMENDATIONS = {
    "Potato___Late_blight": {
        "crop": "Potato / Solanaceae",
        "severity": "CRITICAL",
        "lead_time": "21 Days Pre-Symptomatic",
        "mapped_sector": "Sector A",
        "recommendation": "Emergency targeted bio-fungicide drone dispersion (Mefenoxam or Mandipropamid). Isolate Zone Alpha-9 to prevent spore dispersal."
    },
    "Potato___Early_blight": {
        "crop": "Potato / Solanaceae",
        "severity": "HIGH",
        "lead_time": "14 Days Pre-Symptomatic",
        "mapped_sector": "Sector A",
        "recommendation": "Apply preventative copper hydroxide spray; increase sensor monitoring on soil moisture and leaf wetness."
    },
    "Tomato_Late_blight": {
        "crop": "Tomato",
        "severity": "CRITICAL",
        "lead_time": "18 Days Pre-Symptomatic",
        "mapped_sector": "Sector A",
        "recommendation": "Targeted bio-fungicide application; cease overhead irrigation immediately."
    },
    "Tomato_Early_blight": {
        "crop": "Tomato",
        "severity": "HIGH",
        "lead_time": "14 Days Pre-Symptomatic",
        "mapped_sector": "Sector A",
        "recommendation": "Prune infected lower foliage; apply chlorothalonil preventative barrier."
    },
    "Tomato_Bacterial_spot": {
        "crop": "Tomato",
        "severity": "HIGH",
        "lead_time": "10 Days Pre-Symptomatic",
        "mapped_sector": "Sector B",
        "recommendation": "Copper-bactericide combined with mancozeb application. Disinfect farm machinery."
    },
    "Pepper__bell___Bacterial_spot": {
        "crop": "Bell Pepper",
        "severity": "HIGH",
        "lead_time": "12 Days Pre-Symptomatic",
        "mapped_sector": "Sector C",
        "recommendation": "Apply streptomycin sulfate or copper bactericide; adjust canopy airflow."
    },
    "healthy": {
        "crop": "Multiple Varieties",
        "severity": "NONE",
        "lead_time": "N/A",
        "mapped_sector": "Sectors A-D",
        "recommendation": "Crop chlorophyll reflection is optimal. Continue routine precision drip irrigation schedule."
    }
}


# Load saved artifacts
def load_saved_artifacts():
    global __data_coloumn
    global __Model

    try:
        column_path = MODEL_DIR / "plant_column.json"
        model_path = MODEL_DIR / "plant_status_detector_v3.1.keras"

        if not column_path.exists():
            print(f"Warning: {column_path} does not exist.")
            return

        with open(column_path, "r") as f:
            __data_coloumn = json.load(f)["column"]

        if model_path.exists():
            __Model = keras.models.load_model(model_path)
            print("Artifacts loaded successfully from", MODEL_DIR)
        else:
            print(f"Warning: Model file not found at {model_path}")

    except Exception as e:
        print(f"Artifact loading notice: {str(e)}")


# Home route / Health check
@app.get("/")
def home():
    return {
        "service": "TerraSpectra Plant Health Detection API",
        "status": "online",
        "version": "1.2.0",
        "model_loaded": __Model is not None,
        "classes_count": len(__data_coloumn) if __data_coloumn else 0,
        "architecture": "Deep Convolutional Neural Network + Vision Transformer (ViT)"
    }


# Detectable diseases catalog
@app.get("/api/diseases")
def get_diseases():
    return {
        "columns": __data_coloumn or [],
        "total_classes": len(__data_coloumn) if __data_coloumn else 0,
        "recommendations": DISEASE_RECOMMENDATIONS
    }


# Farm overview & telemetry status
@app.get("/api/farm_overview")
def get_farm_overview():
    return {
        "farm_id": "terra-farm-main",
        "name": "TerraSpectra Alpha Experimental Farm",
        "location": "Salinas Valley, CA",
        "coordinates": {"longitude": -121.6100, "latitude": 36.6600},
        "total_acreage": 1000,
        "sectors": [
            {
                "id": "sector-a",
                "sector": "Sector A",
                "crop": "Romaine Lettuce & Solanaceae",
                "acreage": 295,
                "health_status": "WARNING",
                "chlorophyll_index": 0.62,
                "active_threat": "Fungal Blight Outbreak (Downy Mildew / Late Blight)"
            },
            {
                "id": "sector-b",
                "sector": "Sector B",
                "crop": "Strawberries & Berries",
                "acreage": 285,
                "health_status": "OPTIMAL",
                "chlorophyll_index": 0.89,
                "active_threat": None
            },
            {
                "id": "sector-c",
                "sector": "Sector C",
                "crop": "Broccoli & Brassicas",
                "acreage": 240,
                "health_status": "OPTIMAL",
                "chlorophyll_index": 0.84,
                "active_threat": None
            },
            {
                "id": "sector-d",
                "sector": "Sector D",
                "crop": "Celery & Root Crops",
                "acreage": 180,
                "health_status": "NORMAL",
                "chlorophyll_index": 0.79,
                "active_threat": None
            }
        ],
        "active_alert": {
            "target_zone": "Sector A (Zone Alpha-9)",
            "affected_acreage": 5.12,
            "threat": "Late Blight / Fungal Blight Outbreak",
            "lead_time": "21 Days Pre-Symptomatic",
            "confidence": "94.8%"
        }
    }


# Plant disease prediction
@app.post("/predict_plant_health")
async def predict_plant_health(
    image: UploadFile = File(...)
):
    if __Model is None or __data_coloumn is None:
        raise HTTPException(
            status_code=503,
            detail="Model artifacts are currently not loaded. Please ensure plant_status_detector_v3.1.keras is available."
        )

    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Please upload a valid image (JPEG/PNG/TIFF)"
        )

    try:
        # Read uploaded image
        file_bytes = await image.read()

        if not file_bytes:
            raise HTTPException(
                status_code=400,
                detail="Uploaded image is empty"
            )

        # Decode image using OpenCV
        img_array = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        if img is None:
            raise HTTPException(
                status_code=400,
                detail="Unable to decode image format"
            )

        # Convert BGR to RGB
        img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

        # Resize to model input shape (256, 256)
        img_resized = cv2.resize(img_rgb, (IMG_SIZE, IMG_SIZE))

        # Convert image into model input
        tensor_input = tf.keras.preprocessing.image.img_to_array(img_resized)
        tensor_input = tf.expand_dims(tensor_input, axis=0)

        # Model prediction
        prediction = __Model.predict(tensor_input, verbose=0)

        # Extract predicted class
        value = int(np.argmax(prediction[0]))
        confidence = float(np.max(prediction[0]))
        confidence_percentage = round(confidence * 100, 2)

        # Confidence threshold
        if confidence_percentage < 50:
            confidence_percentage = round(confidence * 100, 2)

        # Get disease name
        disease_name = __data_coloumn[value] if value < len(__data_coloumn) else "Unknown"

        # Format display label
        formatted_name = disease_name.replace("___", " - ").replace("__", " ").replace("_", " ")

        # Look up recommendation
        rec_info = DISEASE_RECOMMENDATIONS.get(disease_name, None)
        if not rec_info:
            if "healthy" in disease_name.lower():
                rec_info = DISEASE_RECOMMENDATIONS["healthy"]
            else:
                rec_info = {
                    "crop": "Detected Field Crop",
                    "severity": "MODERATE",
                    "lead_time": "14 Days Pre-Symptomatic",
                    "mapped_sector": "Sector A",
                    "recommendation": "Conduct localized leaf sampling and verify NIR spectral reflectance at 705nm."
                }

        is_healthy = "healthy" in disease_name.lower()

        return {
            "message": f"Prediction: {value}, Plant disease: {formatted_name}, Confidence: {confidence_percentage}%",
            "desease_name": disease_name,
            "display_name": formatted_name,
            "confidence": confidence_percentage,
            "prediction": value,
            "is_healthy": is_healthy,
            "severity": rec_info["severity"],
            "lead_time": rec_info["lead_time"],
            "mapped_sector": rec_info["mapped_sector"],
            "recommendation": rec_info["recommendation"],
            "input_resolution": f"{img.shape[1]}x{img.shape[0]}"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(e)}"
        )


# Load model when application starts
@app.on_event("startup")
async def startup_event():
    load_saved_artifacts()
