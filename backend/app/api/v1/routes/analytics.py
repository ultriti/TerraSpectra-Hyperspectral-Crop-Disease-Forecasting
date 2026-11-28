"""
TerraSpectra – Analytics & Geo-Prediction Endpoints
=====================================================
GET /api/analytics        – farm-level stats + model metrics
GET /api/geo-predictions  – GeoJSON overlay for Deck.gl map
"""

import json
import datetime
import random
from pathlib import Path

import numpy as np
from fastapi import APIRouter

router = APIRouter(tags=["Analytics"])

BASE_DIR   = Path(__file__).resolve().parents[4]   # backend/
OUTPUT_DIR = BASE_DIR / "data" / "output"
EVAL_DIR   = BASE_DIR / "evaluation"


# ══════════════════════════════════════════════════════════════════════════════
# GET /api/analytics
# ══════════════════════════════════════════════════════════════════════════════
@router.get("/analytics")
def get_analytics():
    """Returns farm-level analytics and model metrics."""

    result = {
        "farm_id":           "doddaballapura-block-a",
        "farm_name":         "Doddaballapura Wheat Farm – Block A",
        "location":          "Doddaballapura Taluk, Bangalore Rural, Karnataka",
        "coordinates":       {"latitude": 13.2940, "longitude": 77.5230},
        "area_acres":        20.4,
        "crop_type":         "Wheat (Triticum aestivum) + Ragi",
        "monitoring_status": "Active – Hyperspectral Analysis",
        "last_updated":      datetime.datetime.utcnow().isoformat() + "Z",
        "dataset_info": {
            "name":             "TerraSpectra Synthetic HSI",
            "shape":            "100×100×30",
            "bands":            30,
            "wavelength_range": "450–950 nm",
            "classes":          ["Healthy (0)", "Stressed (1)"],
        },
    }

    # ── Prediction summary from saved maps ────────────────────────────────
    pred_path = OUTPUT_DIR / "prediction_map.npy"
    conf_path = OUTPUT_DIR / "confidence_map.npy"

    if pred_path.exists() and conf_path.exists():
        try:
            pred_map = np.load(pred_path)
            conf_map = np.load(conf_path)
            total    = int(pred_map.size)
            healthy  = int(np.sum(pred_map == 0))
            stressed = int(np.sum(pred_map == 1))
            stress_pct = round(stressed / total * 100, 2) if total > 0 else 0.0
            result["prediction_summary"] = {
                "total_pixels":        total,
                "healthy_pixels":      healthy,
                "stressed_pixels":     stressed,
                "stress_percentage":   stress_pct,
                "mean_confidence":     round(float(np.mean(conf_map)), 4),
                "max_stress_confidence": round(float(np.max(conf_map)), 4),
            }
            result["health_index"] = round(healthy / total * 100, 1) if total > 0 else 100.0
            result["risk_level"] = (
                "HIGH"     if stress_pct > 40 else
                "MODERATE" if stress_pct > 20 else
                "LOW"
            )
        except Exception as exc:
            result["prediction_summary"] = {"error": str(exc)}
            result["health_index"] = 70.7
            result["risk_level"]   = "MODERATE"
    else:
        # Mock values for demo when no prediction files exist yet
        result["prediction_summary"] = {
            "total_pixels":        1024,
            "healthy_pixels":      724,
            "stressed_pixels":     300,
            "stress_percentage":   29.3,
            "mean_confidence":     0.72,
            "max_stress_confidence": 0.95,
        }
        result["health_index"] = 70.7
        result["risk_level"]   = "MODERATE"

    # ── Model metrics from training JSON ──────────────────────────────────
    metrics_file = EVAL_DIR / "training_metrics.json"
    if metrics_file.exists():
        try:
            with open(metrics_file) as f:
                mdata = json.load(f)
            result["model_metrics"] = mdata.get("final_metrics", {})
            tl = mdata.get("train_loss", [None])
            vl = mdata.get("val_loss",   [None])
            result["training_history"] = {
                "epochs":           len(mdata.get("train_loss", [])),
                "final_train_loss": tl[-1] if tl else None,
                "final_val_loss":   vl[-1] if vl else None,
            }
        except Exception:
            result["model_metrics"]    = {}
            result["training_history"] = None
    else:
        result["model_metrics"]    = {}
        result["training_history"] = None

    return result


# ══════════════════════════════════════════════════════════════════════════════
# GET /api/geo-predictions
# ══════════════════════════════════════════════════════════════════════════════
@router.get("/geo-predictions")
def get_geo_predictions():
    """Returns crop-health predictions as a GeoJSON FeatureCollection."""

    # 1. Prefer the pre-generated file (created by train_3dcnn.py)
    geo_path = OUTPUT_DIR / "geo_predictions.json"
    if geo_path.exists():
        try:
            with open(geo_path) as f:
                return json.load(f)
        except Exception:
            pass

    # 2. Derive from prediction_map.npy if it exists
    pred_path = OUTPUT_DIR / "prediction_map.npy"
    conf_path = OUTPUT_DIR / "confidence_map.npy"
    if pred_path.exists() and conf_path.exists():
        pred_map = np.load(pred_path)
        conf_map = np.load(conf_path)
        H, W     = pred_map.shape
        LAT_N, LAT_S = 13.2840, 13.2800
        LON_W, LON_E = 77.5200, 77.5250
        features = []
        step = max(1, H // 20)
        for r in range(0, H, step):
            for c in range(0, W, step):
                lat = LAT_N - (r / (H - 1)) * (LAT_N - LAT_S)
                lon = LON_W + (c / (W - 1)) * (LON_E - LON_W)
                cls = int(pred_map[r, c])
                prob = float(conf_map[r, c])
                features.append({
                    "type": "Feature",
                    "geometry": {"type": "Point",
                                 "coordinates": [round(lon, 6), round(lat, 6)]},
                    "properties": {
                        "class":       cls,
                        "label":       "Stressed" if cls == 1 else "Healthy",
                        "probability": round(prob, 3),
                        "row": r, "col": c,
                    },
                })
        return {"type": "FeatureCollection", "features": features}

    # 3. Fully synthetic fallback (200 mock points matching real farm bbox)
    # Farm: Doddaballapura Taluk, Bangalore Rural, Karnataka
    LAT_N, LAT_S = 13.2970, 13.2910
    LON_W, LON_E = 77.5195, 77.5262
    rng = random.Random(42)
    features = []
    for row in range(10):
        for col in range(20):
            lat = LAT_N - (row / 9)  * (LAT_N - LAT_S)
            lon = LON_W + (col / 19) * (LON_E - LON_W)
            # Stress cluster in SE quadrant (col>=12, row>=6) → Sector D
            is_stressed = col >= 12 and row >= 6
            cls  = 1 if is_stressed else 0
            prob = round(0.65 + row * 0.02 + rng.uniform(0, 0.05), 3) if is_stressed \
                   else round(0.10 + row * 0.03 + rng.uniform(0, 0.04), 3)
            prob = min(0.98, max(0.02, prob))
            features.append({
                "type": "Feature",
                "geometry": {"type": "Point",
                             "coordinates": [round(lon, 6), round(lat, 6)]},
                "properties": {
                    "class":       cls,
                    "label":       "Stressed" if cls == 1 else "Healthy",
                    "probability": prob,
                    "row": row, "col": col,
                },
            })
    return {"type": "FeatureCollection", "features": features}
